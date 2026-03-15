import { Request, Response, NextFunction } from 'express';
import { LoginDto, RegisterDto, AuthResponse, ApiResponse } from '@mindfuel/types';
import { hashPassword, comparePassword, generateToken } from '@mindfuel/utils';
import { config } from '@mindfuel/config';
import { getSupabase } from '../../lib/supabase';
import { AppError } from '../../middleware/error-handler';

export const register = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response<ApiResponse<AuthResponse>>,
  next: NextFunction
) => {
  try {
    const { email, password, full_name, phone_number } = req.body;
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await hashPassword(password);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        full_name,
        phone_number,
        role: 'user',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create user');

    const accessToken = generateToken(
      { sub: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      config.jwt.expiresIn
    );

    const refreshToken = generateToken(
      { sub: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      '30d'
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt.toISOString(),
    });

    delete user.password_hash;

    res.status(201).json({
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 604800,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginDto>,
  res: Response<ApiResponse<AuthResponse>>,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase();

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'Account is not active');
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const accessToken = generateToken(
      { sub: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      config.jwt.expiresIn
    );

    const refreshToken = generateToken(
      { sub: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      '30d'
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt.toISOString(),
    });

    delete user.password_hash;

    res.json({
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 604800,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response<ApiResponse<{ access_token: string; refresh_token: string }>>,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError(400, 'Refresh token is required');
    }

    const supabase = getSupabase();

    const { data: tokenRecord } = await supabase
      .from('refresh_tokens')
      .select('*, users(*)')
      .eq('token', refresh_token)
      .eq('is_revoked', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!tokenRecord) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    await supabase
      .from('refresh_tokens')
      .update({ is_revoked: true })
      .eq('id', tokenRecord.id);

    const newAccessToken = generateToken(
      { sub: tokenRecord.user_id, email: tokenRecord.users.email, role: tokenRecord.users.role },
      config.jwt.secret,
      config.jwt.expiresIn
    );

    const newRefreshToken = generateToken(
      { sub: tokenRecord.user_id, email: tokenRecord.users.email, role: tokenRecord.users.role },
      config.jwt.secret,
      '30d'
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase.from('refresh_tokens').insert({
      user_id: tokenRecord.user_id,
      token: newRefreshToken,
      expires_at: expiresAt.toISOString(),
    });

    res.json({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body;
    const supabase = getSupabase();

    if (refresh_token) {
      await supabase
        .from('refresh_tokens')
        .update({ is_revoked: true })
        .eq('token', refresh_token);
    }

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const supabase = getSupabase();

    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const resetToken = generateToken(
      { sub: user.id, email: user.email, role: 'user' },
      config.jwt.secret,
      '1h'
    );

    await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token: resetToken,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    });

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
) => {
  try {
    const { token, new_password } = req.body;
    const supabase = getSupabase();

    const { data: resetToken } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!resetToken) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(new_password);

    await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', resetToken.user_id);

    await supabase
      .from('password_reset_tokens')
      .update({ is_used: true })
      .eq('id', resetToken.id);

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

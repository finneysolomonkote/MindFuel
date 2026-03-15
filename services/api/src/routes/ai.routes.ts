import { Router } from 'express';
import { UserRole } from '@mindfuel/types';
import { authenticate, authorize } from '../middleware/auth';
import {
  listConversations,
  getConversation,
  createConversation,
  sendMessage,
  deleteConversation,
  getPromptTemplates,
  createPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  getModelConfigs,
  createModelConfig,
  updateModelConfig,
  getAIUsageStats,
} from '../modules/ai/ai.handlers';

const router = Router();

router.use(authenticate);

router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.post('/conversations', createConversation);
router.post('/messages', sendMessage);
router.delete('/conversations/:id', deleteConversation);

router.get('/prompts', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getPromptTemplates);
router.post('/prompts', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createPromptTemplate);
router.put('/prompts/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updatePromptTemplate);
router.delete('/prompts/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deletePromptTemplate);

router.get('/models', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getModelConfigs);
router.post('/models', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createModelConfig);
router.put('/models/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateModelConfig);

router.get('/usage', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAIUsageStats);

export default router;

import { Status } from './common';

export enum ProductType {
  WORKBOOK = 'workbook',
  COURSE = 'course',
  COACHING = 'coaching',
  SUBSCRIPTION = 'subscription',
}

export interface Product {
  id: string;
  name: string;
  description: string;
  product_type: ProductType;
  workbook_id?: string;
  price: number;
  currency: string;
  image_url?: string;
  features: string[];
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  product_type: ProductType;
  workbook_id?: string;
  price: number;
  currency: string;
  image_url?: string;
  features: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  features?: string[];
  status?: Status;
}

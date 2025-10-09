import { inject, injectable } from "tsyringe";
import { CategoriesRepository } from "../repositories/categories.repository";
import { ProductsRepository } from "../repositories/products.repository";
import type { CategoryDTO } from "../types/category.dto";
import type {
  ProductDTO,
  ProductVariantDTO,
  VariantDetailDTO,
} from "../types/variant-detail.dto";

@injectable()
export class ProductsService {
  constructor(
    @inject(ProductsRepository)
    private readonly productsRepository: ProductsRepository,
    @inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository
  ) {}

  /**
   * Get all categories with optional search
   */
  async getCategories(searchTerm?: string): Promise<CategoryDTO[]> {
    return this.productsRepository.getCategories(searchTerm);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<CategoryDTO | undefined> {
    return this.productsRepository.getCategoryById(categoryId);
  }

  /**
   * Get variants by category with pagination
   */
  async getVariantsByCategory(
    categoryId: string,
    storeId: string,
    searchTerm: string | undefined,
    limit: number,
    offset: number
  ): Promise<VariantDetailDTO[]> {
    return this.productsRepository.getVariantsByCategory(
      categoryId,
      storeId,
      searchTerm,
      limit,
      offset
    );
  }

  /**
   * Get variant with details by ID
   */
  async getVariantWithDetails(
    variantId: string,
    storeId: string
  ): Promise<VariantDetailDTO | undefined> {
    return this.productsRepository.getVariantWithDetails(variantId, storeId);
  }

  /**
   * Find variant by ID
   */
  async findVariantById(
    variantId: string
  ): Promise<ProductVariantDTO | undefined> {
    return this.productsRepository.findVariantById(variantId);
  }

  /**
   * Find product by ID
   */
  async findProductById(productId: string): Promise<ProductDTO | undefined> {
    return this.productsRepository.findProductById(productId);
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: { name: string }): Promise<void> {
    return this.categoriesRepository.createCategory(categoryData);
  }

  /**
   * Update a category
   */
  async updateCategory(categoryData: {
    id: string;
    name: string;
  }): Promise<void> {
    return this.categoriesRepository.updateCategory(categoryData);
  }
}

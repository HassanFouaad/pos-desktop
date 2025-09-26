import { useEffect, useState } from "react";
import {
  StoreDTO,
  storesRepository,
} from "../../stores/repositories/stores.repository";
import { CategorySelection } from "../components/CategorySelection";
import { ProductList } from "../components/ProductList";
import { CategoryDTO } from "../repositories/products.repository";

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(
    null
  );
  const [store, setStore] = useState<StoreDTO | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      const currentStore = await storesRepository.getCurrentStore();
      setStore(currentStore);
    };
    fetchStore();
  }, []);

  const handleSelectCategory = (category: CategoryDTO) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  if (selectedCategory && store) {
    return (
      <ProductList
        category={selectedCategory}
        onBack={handleBackToCategories}
        store={store}
      />
    );
  }

  return <CategorySelection onSelectCategory={handleSelectCategory} />;
};

export default ProductsPage;

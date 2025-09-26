import { useEffect, useState } from "react";
import {
  StoreDTO,
  storesRepository,
} from "../../stores/repositories/stores.repository";
import { CategorySelection } from "../components/CategorySelection";
import { ProductList } from "../components/ProductList";
import { CategoryDTO } from "../types/category.dto";

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

  if (selectedCategory && store) {
    return <ProductList category={selectedCategory} store={store} />;
  }

  return <CategorySelection onSelectCategory={handleSelectCategory} />;
};

export default ProductsPage;

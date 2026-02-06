import { useState, useEffect, useRef } from "react";
import { getProduct, getUserProfile, incrementView, type Product } from "../sdk/firebase";

export function useProductDetail(id?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerNickname, setSellerNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const processedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 조회수 증가 (한 번만)
        if (processedIdRef.current !== id) {
          processedIdRef.current = id;
          await incrementView(id).catch((err) => console.error("Failed to increment view", err));
        }

        // 상품 정보 가져오기
        const productData = await getProduct(id);
        setProduct(productData);

        // 판매자 정보 가져오기 (Waterfall 방지를 위해 병렬 처리 가능하지만, sellerId가 필요하므로 순차 처리)
        if (productData?.sellerId) {
          const profile = await getUserProfile(productData.sellerId);
          if (profile?.nickname) {
            setSellerNickname(profile.nickname as string);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { product, sellerNickname, loading };
}

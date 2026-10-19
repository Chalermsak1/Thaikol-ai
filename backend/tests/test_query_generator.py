from schemas.brand import BrandProfile
from services.query_generator import generate_kol_search_queries


def test_generate_kol_search_queries_deduplication_and_limit():
    brand = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Herbal Haircare",
        products_services=["แชมพูมะกรูด", "ทรีทเม้นท์"],
        content_themes=["Haircare Tips", "Organic Living"],
        keywords=["แชมพูสมุนไพร", "ลดผมร่วง", "ออร์แกนิก"],
        summary="Herbal brand",
    )

    queries = generate_kol_search_queries(brand, max_queries=5)
    assert len(queries) <= 5
    assert len(queries) == len(set(q.lower() for q in queries))
    assert "แชมพูสมุนไพร" in queries or "แชมพูมะกรูด" in queries


def test_generate_kol_search_queries_multilingual_splitting():
    brand = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Natural Beauty",
        products_services=["แชมพูอัญชัน / Butterfly Pea Shampoo", "ครีมนวดมะกรูด (สูตรเข้มข้น)"],
        content_themes=["ลดผมร่วง"],
        keywords=["organic skincare"],
        summary="Herbal haircare",
    )

    queries = generate_kol_search_queries(brand, max_queries=10)
    # Slashes should be removed and split into clean phrases
    assert not any("/" in q for q in queries)
    # Clean Thai phrase extracted
    assert any("แชมพูอัญชัน" in q for q in queries)
    # Review intent generated cleanly without slash
    assert any("รีวิวแชมพูอัญชัน" in q for q in queries)
    # Clean English phrase extracted
    assert any("Butterfly Pea Shampoo" in q for q in queries)

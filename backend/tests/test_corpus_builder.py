from services.corpus_builder import corpus_builder


def test_corpus_builder_merges_sources_and_attributes():
    """Test that BrandCorpusBuilder merges website and Facebook signals while preserving source links."""
    web_data = {
        "final_url": "https://www.example.com",
        "page_title": "Example Herbal Brand | Natural Care",
        "og_title": "Example Herbal Brand",
        "meta_description": "We make 100% natural herbal shampoo in Bangkok.",
        "headings": ["Products", "About Our Mission"],
        "visible_text": "We make 100% natural herbal shampoo in Bangkok. Best solution for hair loss.",
        "extraction_status": "success",
    }
    fb_data = {
        "page_url": "https://www.facebook.com/examplebrand",
        "page_name": "Example Herbal Brand Official",
        "page_category": "Health & Beauty",
        "about": "Official Facebook page for Example Herbal Brand.",
        "recent_posts": [
            {
                "post_id": "p101",
                "text": "Try our butterfly pea shampoo today! #herbal",
                "post_url": "https://www.facebook.com/examplebrand/posts/p101",
            }
        ],
        "extraction_status": "success",
    }

    corpus = corpus_builder.build_corpus(web_data, fb_data)

    assert "Example Herbal Brand" in corpus.brand_name_candidates
    assert "Example Herbal Brand Official" in corpus.brand_name_candidates
    assert "100% natural herbal shampoo" in corpus.website_text
    assert "Official Facebook page" in corpus.facebook_about
    assert len(corpus.facebook_post_texts) == 1
    assert "butterfly pea shampoo" in corpus.facebook_post_texts[0]

    # Check source attribution
    web_refs = [r for r in corpus.source_references if r.source == "website"]
    fb_refs = [r for r in corpus.source_references if r.source == "facebook"]

    assert len(web_refs) > 0
    assert len(fb_refs) > 0
    assert any("p101" == r.post_id for r in fb_refs)
    assert any("butterfly pea shampoo" in r.text for r in fb_refs)


def test_corpus_builder_handles_single_source():
    """Test corpus builder when only website or only Facebook succeeded."""
    web_data = {
        "final_url": "https://www.web-only.com",
        "page_title": "Web Only Brand",
        "visible_text": "Web-only content text.",
        "headings": ["Heading 1"],
        "extraction_status": "success",
    }
    corpus = corpus_builder.build_corpus(web_data, None)

    assert corpus.metadata["website_extracted"] is True
    assert corpus.metadata["facebook_extracted"] is False
    assert len(corpus.source_references) > 0
    assert all(r.source == "website" for r in corpus.source_references)

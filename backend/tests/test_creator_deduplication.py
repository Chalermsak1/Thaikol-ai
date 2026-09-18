import pytest
from typing import Any, Dict, List
from services.interfaces import TikTokProvider
from services.tiktok_discovery_service import TikTokDiscoveryService
from schemas.kol import TikTokDiscoveryRequest


class MockMultiQueryProvider(TikTokProvider):
    """Synthetic provider returning overlapping creators for different queries to test deduplication."""

    def discover_kols_by_keywords(
        self, keywords: List[str], limit: int = 20
    ) -> List[Dict[str, Any]]:
        query = keywords[0] if keywords else "general"

        if query == "query_a":
            return [
                {
                    "video_id": "vid_101",
                    "video_url": "https://www.tiktok.com/@thai_herbalist/video/101",
                    "creator_username": "@Thai_Herbalist",  # Mixed case with @
                    "creator_display_name": "หมอสมุนไพรไทย",
                    "creator_bio": "สมุนไพรรักษาผมและผิว",
                    "creator_profile_url": "https://www.tiktok.com/@thai_herbalist",
                    "follower_count": 100000,
                    "views": 50000,
                    "likes": 2000,
                    "comments": 100,
                    "shares": 50,
                    "saves": 150,
                    "hashtags": ["สมุนไพร", "ผมร่วง"],
                    "caption": "สูตรสมุนไพรลดผมร่วงใน 7 วัน",
                },
                {
                    "video_id": "vid_201",
                    "video_url": "https://www.tiktok.com/@green_bangkok/video/201",
                    "creator_username": "green_bangkok",
                    "creator_display_name": "Green Bangkok",
                    "creator_bio": "ชีวิตคลีนในกรุงเทพฯ",
                    "creator_profile_url": "https://www.tiktok.com/@green_bangkok",
                    "follower_count": 50000,
                    "views": 20000,
                    "likes": 800,
                    "comments": 40,
                    "shares": 20,
                    "saves": 60,
                    "hashtags": ["bangkok", "organic"],
                    "caption": "รีวิวร้านออร์แกนิกกลางกรุงเทพฯ",
                },
            ]
        elif query == "query_b":
            # Returns thai_herbalist AGAIN with a second video and slightly updated follower count
            return [
                {
                    "video_id": "vid_102",
                    "video_url": "https://www.tiktok.com/@thai_herbalist/video/102",
                    "creator_username": "thai_herbalist",  # Lowercase without @
                    "creator_display_name": "หมอสมุนไพรไทย",
                    "creator_bio": "สมุนไพรรักษาผมและผิว",
                    "creator_profile_url": "https://www.tiktok.com/@thai_herbalist",
                    "follower_count": 105000,  # Higher count
                    "views": 70000,
                    "likes": 3000,
                    "comments": 200,
                    "shares": 100,
                    "saves": 250,
                    "hashtags": ["สมุนไพร", "แชมพู"],
                    "caption": "สระผมด้วยว่านหางจระเข้สด",
                }
            ]
        return []

    def get_profile_details(self, handle: str) -> Dict[str, Any]:
        return {}


def test_creator_deduplication_and_metric_aggregation():
    provider = MockMultiQueryProvider()
    service = TikTokDiscoveryService(provider=provider)

    req = TikTokDiscoveryRequest(
        queries=["query_a", "query_b"],
        max_results_per_query=10,
        max_candidates=10,
    )

    resp = service.discover_and_aggregate(req, db=None)

    assert resp.status == "success"
    # Even though query_a returned 2 videos and query_b returned 1 video for thai_herbalist,
    # thai_herbalist should be deduplicated into 1 candidate! Total candidates = 2.
    assert resp.candidate_count == 2

    # Find the deduplicated candidate
    herbalist = next(c for c in resp.candidates if c.normalized_username == "thai_herbalist")

    # 1. Deduplicated candidate attributes
    assert herbalist.username == "Thai_Herbalist"
    assert herbalist.normalized_username == "thai_herbalist"
    assert herbalist.follower_count == 105000  # Updated to higher follower count
    assert herbalist.sample_video_count == 2

    # 2. Matched queries merged
    assert sorted(herbalist.matched_queries) == ["query_a", "query_b"]

    # 3. Hashtags merged and unique
    assert sorted(herbalist.hashtags) == ["ผมร่วง", "สมุนไพร", "แชมพู"]

    # 4. Captions merged
    assert len(herbalist.sample_captions) == 2
    assert "สูตรสมุนไพรลดผมร่วงใน 7 วัน" in herbalist.sample_captions
    assert "สระผมด้วยว่านหางจระเข้สด" in herbalist.sample_captions

    # 5. Aggregated metrics:
    # Views: 50000 + 70000 = 120000; avg = 60000.0
    assert herbalist.total_views == 120000
    assert herbalist.average_views == 60000.0

    # Likes: 2000 + 3000 = 5000; avg = 2500.0
    assert herbalist.total_likes == 5000
    assert herbalist.average_likes == 2500.0

    # Comments: 100 + 200 = 300; avg = 150.0
    assert herbalist.total_comments == 300
    assert herbalist.average_comments == 150.0

    # Shares: 50 + 100 = 150; avg = 75.0
    assert herbalist.total_shares == 150
    assert herbalist.average_shares == 75.0

    # Saves: 150 + 250 = 400; avg = 200.0
    assert herbalist.total_saves == 400
    assert herbalist.average_saves == 200.0

    # Estimated Engagement Rate:
    # Formula: (avg_likes + avg_comments + avg_shares) / max(follower_count, 1)
    # (2500.0 + 150.0 + 75.0) / 105000 = 2725.0 / 105000 = 0.02595... -> 0.026
    assert herbalist.estimated_engagement_rate is not None
    assert round(herbalist.estimated_engagement_rate, 4) == round(2725.0 / 105000, 4)

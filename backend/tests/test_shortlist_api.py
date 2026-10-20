import pytest
from starlette.testclient import TestClient


def test_shortlist_crud_workflow(client: TestClient):
    # 1. Initially check list
    res_list = client.get("/api/v1/shortlist?campaign_id=test_campaign")
    assert res_list.status_code == 200
    assert isinstance(res_list.json(), list)

    # 2. Add an item to shortlist
    item_payload = {
        "username": "bellabelllies",
        "campaign_id": "test_campaign",
        "status": "shortlisted",
        "notes": "สนใจร่วมงานแคมเปญสกินแคร์",
        "agreed_rate_thb": 12000.0,
        "deliverable_format": "1 TikTok Video (60s) + Product link",
        "creator": {
            "username": "bellabelllies",
            "display_name": "Bella Bellies",
            "follower_count": 250000,
            "average_views": 65000.0,
        },
    }
    res_create = client.post("/api/v1/shortlist", json=item_payload)
    assert res_create.status_code == 200
    created = res_create.json()
    assert created["username"] == "bellabelllies"
    assert created["status"] == "shortlisted"
    assert created["agreed_rate_thb"] == 12000.0
    assert created["creator"]["follower_count"] == 250000

    # 3. Update status and milestone details (e.g. moved to confirmed, draft due date)
    update_payload = {
        "status": "confirmed",
        "draft_due_date": "2026-11-01",
        "live_date": "2026-11-07",
        "notes": "ตกลงบรีฟเรียบร้อย ส่งสินค้าทดลองแล้ว",
    }
    res_update = client.put(
        "/api/v1/shortlist/bellabelllies?campaign_id=test_campaign",
        json=update_payload,
    )
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["status"] == "confirmed"
    assert updated["draft_due_date"] == "2026-11-01"
    assert "ตกลงบรีฟ" in updated["notes"]

    # 4. Update post-campaign tracking metrics (live video URL, actual views)
    post_tracking_payload = {
        "status": "completed",
        "live_post_url": "https://www.tiktok.com/@bellabelllies/video/7123456789",
        "actual_views": 85000,
        "actual_likes": 4200,
        "actual_comments": 150,
        "actual_shares": 95,
        "tracking_status": "live",
    }
    res_tracking = client.put(
        "/api/v1/shortlist/bellabelllies?campaign_id=test_campaign",
        json=post_tracking_payload,
    )
    assert res_tracking.status_code == 200
    tracked = res_tracking.json()
    assert tracked["status"] == "completed"
    assert tracked["live_post_url"] == "https://www.tiktok.com/@bellabelllies/video/7123456789"
    assert tracked["actual_views"] == 85000
    assert tracked["tracking_status"] == "live"

    # 5. List items filtered by campaign
    res_list_camp = client.get("/api/v1/shortlist?campaign_id=test_campaign")
    assert res_list_camp.status_code == 200
    camp_items = res_list_camp.json()
    assert any(it["username"] == "bellabelllies" for it in camp_items)

    # 6. Delete item from shortlist
    res_del = client.delete("/api/v1/shortlist/bellabelllies?campaign_id=test_campaign")
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "deleted"

    # Verify deleted
    res_list_after = client.get("/api/v1/shortlist?campaign_id=test_campaign")
    assert not any(it["username"] == "bellabelllies" for it in res_list_after.json())


def test_shortlist_sync_batch(client: TestClient):
    batch_payload = {
        "items": [
            {
                "username": "creator_sync_1",
                "campaign_id": "batch_camp",
                "status": "contacted",
                "notes": "ทัก DM แล้ว",
            },
            {
                "username": "creator_sync_2",
                "campaign_id": "batch_camp",
                "status": "shortlisted",
                "notes": "รอพิจารณา",
            },
        ]
    }
    res_sync = client.post("/api/v1/shortlist/sync", json=batch_payload)
    assert res_sync.status_code == 200
    data = res_sync.json()
    assert data["status"] == "success"
    assert data["synced_count"] == 2

    # Cleanup
    client.delete("/api/v1/shortlist/creator_sync_1?campaign_id=batch_camp")
    client.delete("/api/v1/shortlist/creator_sync_2?campaign_id=batch_camp")

"""Seed script: creates an admin user and a test API key."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User
from app.models.api_key import ApiKey
from app.services.auth_service import hash_password, generate_api_key


def seed():
    db = SessionLocal()
    try:
        # Create admin user
        admin = db.query(User).filter(User.email == "admin@cdpcrm.com").first()
        if not admin:
            admin = User(
                email="admin@cdpcrm.com",
                hashed_password=hash_password("admin123"),
                full_name="CRM Admin",
                role="admin",
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"Created admin user: admin@cdpcrm.com / admin123")
        else:
            print(f"Admin user already exists: admin@cdpcrm.com")

        # Create a test sales rep
        rep = db.query(User).filter(User.email == "rep@cdpcrm.com").first()
        if not rep:
            rep = User(
                email="rep@cdpcrm.com",
                hashed_password=hash_password("rep123"),
                full_name="Sales Rep",
                role="rep",
            )
            db.add(rep)
            db.commit()
            print(f"Created sales rep: rep@cdpcrm.com / rep123")

        # Create API key for AI agent
        existing_key = db.query(ApiKey).filter(ApiKey.name == "AI Agent Development").first()
        if not existing_key:
            raw_key, key_hash = generate_api_key()
            api_key = ApiKey(
                name="AI Agent Development",
                key_hash=key_hash,
                created_by=admin.id,
            )
            db.add(api_key)
            db.commit()
            print(f"\nAPI Key created (save this, shown only once):")
            print(f"  {raw_key}")
        else:
            print(f"\nAPI key 'AI Agent Development' already exists")

    finally:
        db.close()


if __name__ == "__main__":
    seed()

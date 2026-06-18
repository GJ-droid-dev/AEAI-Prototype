import sys
import os

# Add the backend directory to sys.path so we can import from database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import db

db.init_db()
db.update_entity("Acme Pharmaceuticals", 0.65, "Funded by a major pharmaceutical conglomerate.")
db.update_entity("Global Climate Initiative", -0.1, "Non-profit open-source research initiative.")

print("Entities seeded successfully!")

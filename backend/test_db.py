from pymongo import MongoClient
import os
from dotenv import load_dotenv
import asyncio

db_url = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
if 'test' in db_url: pass # handle if testing

client = MongoClient('mongodb://localhost:27017/')
db = client['event_organizer']

discounts = list(db.discount_codes.find())
print("Discounts:")
for d in discounts: print(d)

events = list(db.events.find())
if events:
    print("\nEvent:")
    print(events[0])
else:
    print("No events")

users = list(db.users.find())
print("\nUsers:")
for u in users: print(f"Email: {u['email']} - Object ID: {u['_id']}")


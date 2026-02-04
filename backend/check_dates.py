import os
import sys
sys.path.insert(0, '/workspace/app/backend')

from supabase import create_client
from datetime import datetime, timedelta

# Get Supabase credentials from environment
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

supabase = create_client(url, key)

print(f"\n{'='*80}")
print(f"📊 BIOMETRIC SCANS DATE ANALYSIS")
print(f"{'='*80}")

# Query biometric measurements
response = supabase.table('biometric_measurements').select(
    'id, user_id, created_at'
).eq(
    'user_id', 'f64c7450-5d60-4442-b41e-bbed33a9f830'
).order(
    'created_at', desc=True
).execute()

scans = response.data

print(f"Total scans found: {len(scans)}")
print(f"Current date: {datetime.now().strftime('%Y-%m-%d')}")
six_months_ago = datetime.now() - timedelta(days=180)
print(f"6 months ago: {six_months_ago.strftime('%Y-%m-%d')}")
print(f"{'='*80}\n")

if scans:
    print("Scan dates (newest to oldest):")
    print(f"{'ID':<40} {'Created At':<25}")
    print("-" * 70)
    
    for scan in scans[:15]:  # Show first 15
        scan_id = scan['id']
        created_at = scan['created_at']
        print(f"{scan_id:<40} {created_at:<25}")
    
    # Parse dates and analyze
    scan_dates = [datetime.fromisoformat(s['created_at'].replace('Z', '+00:00')) for s in scans]
    oldest = min(scan_dates)
    newest = max(scan_dates)
    
    print(f"\n{'='*80}")
    print(f"📅 DATE RANGE SUMMARY:")
    print(f"{'='*80}")
    print(f"Oldest scan: {oldest.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Newest scan: {newest.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Date range: {(newest - oldest).days} days")
    print(f"\n6 months cutoff: {six_months_ago.strftime('%Y-%m-%d')}")
    
    scans_in_range = sum(1 for d in scan_dates if d >= six_months_ago)
    print(f"Scans within last 6 months: {scans_in_range}")
    print(f"Scans older than 6 months: {len(scans) - scans_in_range}")
    
    if scans_in_range == 0:
        print(f"\n⚠️  WARNING: All {len(scans)} scans are older than 6 months!")
        print(f"   Recommendation: Change query to use 12+ months or remove date filter")
        
        # Calculate how many months needed
        months_needed = ((datetime.now() - oldest).days // 30) + 1
        print(f"   Suggested months parameter: {months_needed} (to include all data)")
    else:
        print(f"\n✅ Found {scans_in_range} scans in the last 6 months")
else:
    print("❌ No scans found for this user")

import subprocess
import sys
import time


from config import STOCK_SYMBOLS

universe = STOCK_SYMBOLS

print(f"🌌 Starting FinPredict Universe Training")
print(f"🎯 Targets: {', '.join(universe)}\n")

for i, symbol in enumerate(universe, 1):
    print(f"--------------------------------------------------")
    print(f"🚀 [{i}/{len(universe)}] Starting Training: {symbol}")
    print(f"--------------------------------------------------")
    
    start_time = time.time()
    
    try:
        # Call train.py with the specific symbol
        # We use sys.executable to ensure we use the SAME venv python
        # capture_output=False lets logs stream to stdout
        # Robustly resolve the path to train.py relative to THIS script
        import os
        train_script = os.path.join(os.path.dirname(__file__), "train.py")
        cmd = [sys.executable, train_script, "--symbols", symbol, "--version", "v2"]
        
        result = subprocess.run(cmd, check=True)
        
        duration = round(time.time() - start_time, 2)
        print(f"\n✅ SUCCESS: {symbol} finished in {duration}s")
        
        # 🧊 Cooling Period: Give the GPU/CPU a moment to rest and DB to settle
        print("🧊 Cooling down for 10 seconds...")
        time.sleep(10)
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ FAILURE: {symbol} crashed with exit code {e.returncode}")
        print("⚠️  Skipping to next symbol...")
        continue
    except KeyboardInterrupt:
        print("\n🛑 Universe Training Paused by User")
        break

print("\n🎉 Universe Loop Complete!")

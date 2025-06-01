#!/usr/bin/env python3
"""
U-Cloud Server Monitoring Agent

This script collects server metrics (CPU, RAM, disk usage) and sends them
to the specified API endpoint.
"""

import os
import sys
import json
import time
import platform
import socket
import logging
import argparse
from datetime import datetime
import urllib.request
import urllib.error
import urllib.parse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('server_monitor.log')
    ]
)
logger = logging.getLogger('server_monitor')

def load_config():
    """Load configuration from config.json"""
    try:
        if os.path.exists('config.json'):
            with open('config.json', 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load config file: {e}")
        sys.exit(1)
    
    logger.error("No config.json found")
    sys.exit(1)

def get_cpu_usage():
    """Get CPU usage percentage"""
    try:
        import psutil
        return psutil.cpu_percent(interval=1)
    except ImportError:
        # Fallback for systems without psutil
        try:
            import subprocess
            cmd = "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'"
            output = subprocess.check_output(cmd, shell=True).decode().strip()
            return float(output)
        except:
            return 0.0

def get_memory_usage():
    """Get memory usage percentage"""
    try:
        import psutil
        return psutil.virtual_memory().percent
    except ImportError:
        try:
            import subprocess
            cmd = "free | grep Mem | awk '{print $3/$2 * 100}'"
            output = subprocess.check_output(cmd, shell=True).decode().strip()
            return float(output)
        except:
            return 0.0

def get_disk_usage():
    """Get disk usage percentage"""
    try:
        import psutil
        return psutil.disk_usage('/').percent
    except ImportError:
        try:
            import subprocess
            cmd = "df / | tail -1 | awk '{print $5}' | sed 's/%//'"
            output = subprocess.check_output(cmd, shell=True).decode().strip()
            return float(output)
        except:
            return 0.0

def collect_metrics():
    """Collect all system metrics"""
    return {
        "cpu": round(get_cpu_usage(), 2),
        "ram": round(get_memory_usage(), 2),
        "disk": round(get_disk_usage(), 2)
    }

def send_metrics(config, metrics):
    """Send metrics to the configured API endpoint"""
    data = {
        "metrics": metrics,
        "timestamp": datetime.now().isoformat(),
        "hostname": socket.gethostname()
    }
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {config['api_key']}"
        }
        
        req = urllib.request.Request(
            config['api_endpoint'],
            data=json.dumps(data).encode('utf-8'),
            headers=headers,
            method="POST"
        )
        
        with urllib.request.urlopen(req) as response:
            if response.getcode() == 200:
                logger.info("Metrics sent successfully")
                return True
            else:
                logger.error(f"Failed to send metrics. Status code: {response.getcode()}")
                return False
                
    except Exception as e:
        logger.error(f"Error sending metrics: {e}")
        return False

def main():
    """Main function to run the monitoring agent"""
    parser = argparse.ArgumentParser(description='Server Monitoring Agent')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    parser.add_argument('--debug', action='store_true', help='Enable debug output')
    args = parser.parse_args()
    
    config = load_config()
    
    if args.debug:
        logger.setLevel(logging.DEBUG)
    
    logger.info(f"Starting U-Cloud monitoring agent")
    
    try:
        if args.once:
            metrics = collect_metrics()
            success = send_metrics(config, metrics)
            sys.exit(0 if success else 1)
        else:
            while True:
                metrics = collect_metrics()
                send_metrics(config, metrics)
                time.sleep(config.get('interval', 60))
    except KeyboardInterrupt:
        logger.info("Monitoring agent stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
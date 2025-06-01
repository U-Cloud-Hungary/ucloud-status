# StatusLuxe Server Monitoring Agent

This Python script collects server metrics (CPU, RAM, disk usage) and sends them to your StatusLuxe dashboard.

## Requirements

- Python 3.6 or higher
- `psutil` package (optional but recommended for more accurate metrics)

## Installation

1. Copy the `server_monitor.py` and `config.json` files to your server
2. Install the optional dependencies:

```bash
pip install psutil
```

3. Edit the `config.json` file to configure your settings:

```json
{
  "server_id": "",  // Will be auto-generated if empty
  "server_name": "", // Will use hostname if empty
  "location": "US East", // Set your server location
  "api_endpoint": "https://your-statusluxe-domain.com/api/metrics", // URL to your StatusLuxe API
  "api_key": "YOUR_API_KEY_HERE", // API key from your StatusLuxe dashboard
  "interval": 60, // Seconds between updates
  "debug": false // Set to true for more verbose logging
}
```

## Usage

### Running Manually

```bash
python server_monitor.py
```

### Run Once (for testing)

```bash
python server_monitor.py --once
```

### Enable Debug Mode

```bash
python server_monitor.py --debug
```

## Setting Up as a Service

### Linux (systemd)

1. Create a systemd service file:

```bash
sudo nano /etc/systemd/system/statusluxe-monitor.service
```

2. Add the following content (update paths as needed):

```
[Unit]
Description=StatusLuxe Server Monitoring Agent
After=network.target

[Service]
ExecStart=/usr/bin/python3 /path/to/server_monitor.py
WorkingDirectory=/path/to
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:

```bash
sudo systemctl enable statusluxe-monitor
sudo systemctl start statusluxe-monitor
```

4. Check the status:

```bash
sudo systemctl status statusluxe-monitor
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create a new basic task
3. Name it "StatusLuxe Monitoring"
4. Set the trigger to "When the computer starts"
5. Set the action to "Start a program"
6. Browse to your Python executable (e.g., `C:\Python39\python.exe`)
7. Add arguments: `C:\path\to\server_monitor.py`
8. Set the "Start in" field to the directory containing your script
9. Complete the wizard

## Troubleshooting

Check the `server_monitor.log` file for error messages and detailed logs.

Common issues:
- API connection errors: Verify your API endpoint and network connectivity
- Permission issues: Make sure the script has permission to access system information
- Missing dependencies: Install `psutil` for more reliable metrics

## Security Considerations

- The API key allows access to submit metrics to your dashboard. Keep it secure.
- Consider using a dedicated user with limited permissions to run this script.
- For production environments, consider using HTTPS for the API endpoint.
import subprocess
import json
from datetime import datetime
import re


keywords = ["fail", "error", "timeout", "denied"]
logs = []


def normalize(msg):
    msg = msg.lower()
    msg = re.sub(r'\\_[a-z0-9\.]+', '', msg)  # remove ACPI paths
    msg = re.sub(r'\d+', '', msg)
    return msg.strip()


def rawParsing():
    # print("works")
    Redundent = set()
    proc = subprocess.Popen(
        ["journalctl", "-p", "err", "-b","-o","json"],
        stdout=subprocess.PIPE,
        text=True
    )
    count = 0
    for line in proc.stdout:
        entry = json.loads(line)
        TimeStamp = int(entry.get("__REALTIME_TIMESTAMP", 0)) / 1_000_000        
        BootId = entry.get("_BOOT_ID", "") 
        Source = entry.get("SYSLOG_IDENTIFIER", "") 
        FromWhere = entry.get("_TRANSPORT", "")
        Priority = entry.get("PRIORITY", "") 
        ErrorMessage = entry.get("MESSAGE", "") 
        if not ErrorMessage or ErrorMessage == "None":
             continue
        NormErrorMessage = normalize(ErrorMessage)  

        # log_type: message:, source:
        logs.append({
            "log_type":"ERROR",
            "source": Source,
            "priority": int(Priority),
            "message": NormErrorMessage,

        }) 
    return logs


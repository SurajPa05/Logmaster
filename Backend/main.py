from Core.parser import rawParsing
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

logs = []
app = FastAPI()
log_catg = ["ERROR","WARNING"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    global logs
    logs = rawParsing()
    print(f"Logs loaded: {len(logs)} entries")
    log_count()


@app.get("/logs")
def get_logs():
    return {"logs": logs}

@app.get("/logCount")
def log_count():
    log_types = {}
    for t in log_catg:
        count = sum(1 for log in logs if log.get('log_type') == t)
        log_types[t] = count
    return log_types
    
    

@app.get("/sourcelist")
def sourceList_fetch():
    source  = set()
    for e in logs:
        source.add(e["source"])
    return source
              
def main():
    print("Backend is healthy")
    startup_event()

if __name__ == "__main__":
    main()

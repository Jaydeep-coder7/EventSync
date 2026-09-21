import urllib.request
import re
import json

req = urllib.request.Request("https://21st.dev/@bundui/components/fluid-particles-background", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8")

matches = set(re.findall(r'https://[^\s"\'\\]+', html))
for m in matches:
    if any(k in m for k in ["fluid", "bundui", "larsen66", "cdn.21st.dev", "api"]):
        print(m)

# Also check for code blocks or component definitions inside html
with open("page.html", "w") as f:
    f.write(html)
print("Saved page.html, size:", len(html))

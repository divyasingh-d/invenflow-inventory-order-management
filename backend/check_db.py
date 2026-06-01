import urllib.request
import urllib.error

url = 'https://invenflow-backend.onrender.com/products/'
try:
    with urllib.request.urlopen(url) as response:
        print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error Code:", e.code)
    print("HTTP Error Headers:", dict(e.headers))
    print("HTTP Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Other Error:", e)

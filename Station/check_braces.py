
import re

content = open(r'c:\xampp\htdocs\Maintenance\Station\get_observations.php', 'r').read()
level = 0
for i, char in enumerate(content):
    if char == '{':
        level += 1
        print(f"[{i}] Open: level {level}")
    elif char == '}':
        level -= 1
        print(f"[{i}] Close: level {level}")

if level != 0:
    print(f"Mismatch: final level is {level}")
else:
    print("Braces are balanced.")

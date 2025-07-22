const fs = require('fs');
const path = 'client/src/components/ui/sidebar-menu.tsx';

let content = fs.readFileSync(path, 'utf8');
content = content.replace(/className={submenuItemClass} data-\[active=true]:bg-\[hsl\(var\(--sidebar-accent\)\)] data-\[active=true]:text-\[hsl\(var\(--sidebar-accent-foreground\)\)] hover:bg-\[hsl\(var\(--sidebar-accent\)\)] hover:text-\[hsl\(var\(--sidebar-accent-foreground\)\)]"/g, 'className={submenuItemClass}');
fs.writeFileSync(path, content);
console.log('Fixed broken classNames');

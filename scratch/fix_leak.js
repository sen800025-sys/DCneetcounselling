const fs = require('fs');
const indexPath = 'c:\\Users\\rushi\\Downloads\\DCneetcounselling\\frontend\\web\\index.html';

let content = fs.readFileSync(indexPath, 'utf8');

// Fix the malformed </script>ript> → </script>
content = content.replace('</script>ript>', '</script>');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Fixed script tag leak.');

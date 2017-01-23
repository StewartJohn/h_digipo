# h_digipo
An annotation-powered toolkit for fact checking and investigative journalism

# The embed script

In lib\tpl\dokuwiki\main,php, above <-- wikipage stop -->, put this:


&lt;script>
var s = document.createElement('script');
s.src = "http://jonudell.net/h/doku_h_embed.js"; // or serve your own copy
document.querySelector('.page').appendChild(s);
&lt;/script>

# The Chrome extension

Sources in the /ext directory. To distribute, cd to /ext and do this:

zip -r ..\digipo.zip .

Then upload to the Chrome web store. The example lives here: https://chrome.google.com/webstore/detail/digipo/dllkpndfjcodlhlfiiogdedeipjphkgk. But you can sign up and publish your own variant.



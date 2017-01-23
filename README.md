# h_digipo
An annotation-powered toolkit for fact checking and investigative journalism. Works with Doku wiki and Hypothesis. (Can be adapted for any wiki, or indeed any content management system.)

See https://hypothes.is/blog/a-hypothesis-powered-toolkit-for-fact-checkers/ for description and video demos.

# The embed script

In <tt>lib\tpl\dokuwiki\main.php</tt>, above <tt>&lt;-- wikipage stop --></tt>, put this:

<pre>
&lt;script>
var s = document.createElement('script');
s.src = "http://jonudell.net/h/doku_h_embed.js"; // or serve your own copy
document.querySelector('.page').appendChild(s);
&lt;/script>
</pre>

# The Chrome extension

Sources in the /ext directory. To distribute, cd to /ext and do this:

zip -r ..\digipo.zip .

Then upload to the Chrome web store. The example lives here: https://chrome.google.com/webstore/detail/digipo/dllkpndfjcodlhlfiiogdedeipjphkgk. But you can sign up and publish your own variant.



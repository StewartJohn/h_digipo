# h_digipo
An annotation-powered toolkit for fact checking and investigative journalism. Works with Doku wiki and Hypothesis. (Can be adapted for any wiki, or indeed any content management system.)

See https://hypothes.is/blog/a-hypothesis-powered-toolkit-for-fact-checkers/ for description and video demos.

The user guide for the DigiPo extension: http://digipo.io/doku.php?id=digipo:materials:digipo_extension

## The embed script

In <tt>lib\tpl\dokuwiki\main.php</tt>, above <tt>&lt;-- wikipage stop --></tt>, put this:

<pre>
&lt;script>
var s = document.createElement('script');
s.src = "http://jonudell.net/h/doku_h_embed.js"; // or serve your own copy
document.querySelector('.page').appendChild(s);
&lt;/script>
</pre>

## The CORS proxy

The embed script relies on https://github.com/judell/h_cors for now, because Hypothesis doesn't support CORS at /api/annotations (but will eventually)


var text = getSelectionText();
var q = text + ' (site:www.sourcewatch.com OR site:www.factcheck.org OR site:hoax-slayer.com OR site:www.truthorfiction.com OR site:opensecrets.org OR site:www.politifact.com OR site:snopes.com OR site:www.washingtonpost.com/news/fact-checker/ OR site:digipo.io)' ;
location.href = 'https://google.com/search?q=' + q;


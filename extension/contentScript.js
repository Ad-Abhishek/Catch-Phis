chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
  console.log(message)
  if (message.greeting) {
      const greeting = message.greeting;
      const messageElement = document.getElementsByTagName("body");
      const script = document.createElement('script')
      console.log(messageElement)
      request_anchor_url_stats = getRequestAnchorURL()
      data = {}
      data['url'] = window.location.href //corrected
      // data['origin_url'] = message.url
      data['favicon'] = getFavicon() // corrected
      data['has_title'] = has_title() //corrected
      data['title'] = title()
      data['has_copyright_info'] = has_copyright_info()
      data['has_social_media_links'] = has_social_media_links()
      data['has_description'] = has_description()
      // data['request_url'] = request_anchor_url_stats[0]
      // data['anchor_url'] = request_anchor_url_stats[1]
      // data['meta_script_link'] = getMetaScriptLink()
      data['has_external_form_submit'] = has_external_form_submit() //corrected
      // data['mail_to'] = mail_to()
      // data['redirects'] = message.count
      data['iframe'] = iframe() // corrected
      data['has_hidden_field'] = has_hidden_field() //corrected
      data['has_password_field'] = has_password_field() //corrected
      data['no_of_images'] = no_of_images() //corrected
      data['no_of_css'] = no_of_css() // corrected
      data['no_of_js'] = no_of_js() // corrected
      data['no_of_self_ref'] = no_of_self_ref() //corrected
      // data['empty_external_to_total'] = empty_external_to_total()
      // const onMouseOverValue = await on_mouse_over();
      // data['on_mouse_over'] = onMouseOverValue;
      let base_url = ""
      await fetch(chrome.runtime.getURL('file.txt'))
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(data => {
          // `data` contains the contents of the text file
          base_url = data
          console.log(base_url)
        })
        .catch(error => {
          console.error('Error:', error);
        });
      console.log(base_url)
      console.log(data)
      let p = fetch(base_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data) // Add your JSON data here
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
      console.log(await p)
  }
});

function isInternalLink(url) {
  //same domain
  try{
    const currentDomain = window.location.hostname.split('.').slice(-2).join('.');
    const urlDomain = new URL(url).hostname.split('.').slice(-2).join('.');

    return currentDomain === urlDomain;
  }catch{
    return false
  }
}

function isEmptyLink(url) {
  return !url || url.trim() === '#';
}

function no_of_self_ref(){
  count = 0
  a_links = document.getElementsByTagName('a')
  img_links = document.getElementsByTagName('img')
  link_links = document.getElementsByTagName('link')
  script_links = document.getElementsByTagName('script')
  iframe_links = document.getElementsByTagName('iframe')
  for(let i=0; i<a_links.length; i++){
    if(isInternalLink(a_links[i]['href'])){
      count+=1
    }
  }
  for(let i=0; i<img_links.length; i++){
    if(isInternalLink(img_links[i]['src'])){
      count+=1
    }
  }
  for(let i=0; i<link_links.length; i++){
    if(isInternalLink(link_links[i]['href'])){
      count+=1
    }
  }
  for(let i=0; i<script_links.length; i++){
    if(isInternalLink(script_links[i]['src'])){
      count+=1
    }
  }
  for(let i=0; i<iframe_links.length; i++){
    if(isInternalLink(iframe_links[i]['src'])){
      count+=1
    }
  }
  return count
}

function empty_external_to_total() {
  let no_of_empty = 0;
  let no_of_external = 0;
  let no_of_internal = 0;

  const a_links = document.getElementsByTagName('a');

  // Helper function to count links
  function countLinks(links, attribute) {
    for (let i = 0; i < links.length; i++) {
      const url = links[i][attribute];
      if (isEmptyLink(url)) {
        no_of_empty += 1;
      } else if (isInternalLink(url)) {
        no_of_internal += 1;
      } else {
        no_of_external += 1;
      }
    }
  }

  countLinks(a_links, 'href');

  const numerator = no_of_empty + no_of_external;
  const denominator = no_of_internal + no_of_empty + no_of_external;
  let ratio = 1
  try{
    ratio = denominator === 0 ? 0 : numerator / denominator;
  }catch{
  }

  return ratio;
}

function isInternalAnchorLink(url) {
  //internal hyperlink
  const currentPagePath = window.location.pathname;
  const urlPath = new URL(url).pathname;
  return currentPagePath === urlPath && url.includes("#");
}

function getRequestAnchorURL(){
  let external_links = 0
  let total_urls = 0
  let internal_anchors = 0
  for(let i=0;i<document.getElementsByTagName('a').length;i++){
    let currentURL = document.getElementsByTagName('a')[i]
    if(!currentURL.href){
      continue
    }
    total_urls+=1
    if(!isInternalAnchorLink(currentURL.href)){
      if(!isInternalLink(currentURL.href)){
        external_links +=1
      }
    }else{
      internal_anchors += 1
    }
  }
  console.log(external_links,internal_anchors,total_urls)
  return [external_links/total_urls,(external_links+internal_anchors)/total_urls]
}

function getMetaScriptLink(){
  const meta = Array.from(document.querySelectorAll("meta"))
  const script = Array.from(document.querySelectorAll("script"))
  const link = Array.from(document.querySelectorAll("link"))
  let total_urls = 0
  let internal_urls = 0
  for (let i=0; i<meta.length; i++){
    try{
      url = new URL(meta[i].content)
      total_urls++
      if(isInternalLink(url.href)){
        internal_urls++
      }
    }catch{
      continue
    }
  }

  for (let i=0; i<link.length; i++){
    try{
      url = new URL(link[i].href)
      total_urls++
      if(isInternalLink(url.href)){
        internal_urls++
      }
    }catch{
      continue
    }
  }

  for (let i=0; i<script.length; i++){
    try{
      url = new URL(script[i].src)
      total_urls++
      if(isInternalLink(url.href)){
        internal_urls++
      }
    }catch{
      continue
    }
  }
  console.log(internal_urls,total_urls)
  return internal_urls/total_urls
}

function getFavicon() {
  // Look for the favicon in the document's head
  const favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  
  if (favicon) {
    return 1;
  } else {
    // If not found in the head, try to find it within the document
    const allLinks = Array.from(document.getElementsByTagName('link'));
    const possibleFavicons = allLinks.filter(link => link.rel.includes('icon'));
    if (possibleFavicons.length > 0) {
      const href = possibleFavicons[0].href;
      return 1;
    }

    // If still not found, try extracting it from the website's URL directly
    const domain = document.location.origin;
    const defaultFavicon = domain + '/favicon.ico';
    
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', defaultFavicon, false); // Synchronous XMLHttpRequest
    xhr.send();

    if (xhr.status === 200) {
      return 1;
    } else {
      return 0;
    }
  }
}

function has_external_form_submit() {
  forms = document.getElementsByTagName('form');
  for (let i = 0; i < forms.length; i++) {
      if (forms[i].querySelector('button[type="submit"]')) {
          return 1;
      }
  }
  return 0;
}

function has_hidden_field(){
  fields = document.querySelector('input[type="hidden"]')
  try{
    if(fields.length>0){
      return 1
    }
    return 0
  }catch{
    return 0
  }
}

function has_password_field() {
  var fields = document.querySelectorAll('input[type="password"]');
  try{
    if(fields.length > 0) {
      return 1;
    }
    return 0;
  }catch{
    return 0;
  }
}

function no_of_images(){
  try{
    return document.getElementsByTagName('img').length
  }catch{
    return 0
  }
}

function no_of_css() {
  try{
    return document.querySelectorAll('link[rel="stylesheet"]').length;
  }catch{
    return 0
  }
}

function no_of_js(){
  try{
    return document.querySelectorAll('script["src"]').length;
  }catch{
    return 0
  }
}

function has_title(){
  if(document.getElementsByTagName('title').length>0){
    return 1
  }
  return 0
}

function title(){
  title = document.getElementsByTagName('title')
  if(title.length>0){
    return title[0].textContent
  }
  return ""
}

function findSubstringIndex(list, substring) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].indexOf(substring) !== -1) {
            return i; // Return the index of the first occurrence of the substring in the string
        }
    }
    return -1; // Return -1 if the substring is not found in any of the strings
}

function traverseElements(element, depth, searchTexts,found_elements) {
    fixed_elements = ["footer","nav"]
    if (depth === 0 || !element || !element.childNodes) {
        return;
    }
    
    // Traverse through child nodes
    for (let i = 0; i < element.childNodes.length; i++) {
        let child = element.childNodes[i];
        
        // Check if it's an element node
        if (child.nodeType === 1) {
            for (let j=0;j<searchTexts.length;j++){
                searchText = searchTexts[j]
                if(child.textContent.toLowerCase().indexOf(searchText) === -1 || child.tagName.toLowerCase() === "script"){
                    continue
                }
                if(found_elements.includes(child.parentElement)){
                    found_elements.pop(child.parentElement)
                }
                if(found_elements.includes(child)){
                    continue
                }
                if(fixed_elements.includes(child.tagName.toLowerCase())){
                    // console.log(child,"here")
                    found_elements.push(child)
                    break
                }
                if(findSubstringIndex(child.classList,searchText)){
                    // console.log(child,"here2")
                    found_elements.push(child)
                }
                // Recursive call for children elements
                traverseElements(child, depth - 1,searchTexts,found_elements);
            }
        }
    }
    return found_elements
}

function has_copyright_info(){
  let found_elements = []
  if(traverseElements(document.head, 25,["copyright","©"],found_elements).length>0){
    return 1
  }
  if(traverseElements(document.body, 25,["copyright","©"],found_elements).length>0){
    return 1
  }
  return 0
}

function has_social_media_links(){
  const socialMediaLinks = [];
    
    // List of common social media domains
    const socialMediaDomains = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'];

    // Query all anchor elements on the webpage
    const anchorElements = document.querySelectorAll('a');

    // Iterate through each anchor element
    anchorElements.forEach(anchor => {
        // Check if the href attribute contains any of the social media domains
        socialMediaDomains.forEach(domain => {
            if (anchor.href.includes(domain)) {
                socialMediaLinks.push(anchor.href);
            }
        });
    });
    if(socialMediaLinks.length>0){
      return 1;
    }else{
      return 0;
    }
}

function has_description(){
  items = document.querySelectorAll("meta[name=description]")
  if(items.length>0){
    return 1
  }else{
    return 0
  }
}

function mail_to(){
  //-1 phishing ,1 safe
  forms = document.getElementsByTagName('form')
  for(let i = 0;i<forms.length;i++){
    const form = forms[i]
    if(forms[i].action){
      try{
        url = new URL(forms[i].action)
        if(url.protocol != "http:" && url.protocol != "https:"){
          return -1
        }
      }catch{
        continue
      }
    }
  }
  return 1
}

function on_mouse_over() {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll('[onmouseover]');
    const function_names = [];

    elements.forEach((el) => {
      let code = el.getAttribute('onmouseover');
      code = code.split('(')[0];
      function_names.push(code);
    });

    if (function_names.length > 0) {
      extractWindowStatusFunction(function_names.join(','), function () {
        const script = document.getElementById('mhmpajmoplajebmghhjacjpggnileahk');
        const innerHTML = script.innerHTML;
        resolve(parseInt(innerHTML));
      });
    } else {
      resolve(1);
    }
  });
}


function extractWindowStatusFunction(func,callback) {
  var s = document.createElement('script');
  s.id = 'mhmpajmoplajebmghhjacjpggnileahk'
  s.innerHTML = func
  s.src = chrome.runtime.getURL('helper.js');
  s.onload = callback;
  document.getElementsByTagName('body')[0].appendChild(s)
}

function iframe(){
  elements = document.getElementsByTagName('iframe')
  return elements.length
}
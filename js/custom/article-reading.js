/* Reading enhancements are idempotent across Pjax visits. No article content is rewritten. */
(function () {
  var observer, mutations;
  function boot() {
    if (observer) observer.disconnect();
    if (mutations) mutations.disconnect();
    var post = document.getElementById('post');
    var article = document.getElementById('article-container');
    if (!post || !article) return;
    var toc = document.querySelector('#card-toc .toc');
    if (toc && !post.querySelector('.article-mobile-nav') && !article.querySelector('.seu-page')) {
      var nav = document.createElement('nav');
      nav.className = 'article-mobile-nav';
      nav.setAttribute('aria-label', '文章目录');
      nav.innerHTML = '<details><summary>本篇目录 <span></span></summary><div class="article-mobile-nav__links"></div></details>';
      var copy = toc.cloneNode(true);
      copy.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
      copy.querySelectorAll('.active').forEach(function (node) { node.classList.remove('active'); });
      nav.querySelector('summary span').textContent = toc.children.length + ' 个章节';
      nav.querySelector('.article-mobile-nav__links').appendChild(copy);
      nav.addEventListener('click', function (event) {
        var link = event.target.closest('a[href^="#"]');
        if (!link) return;
        var target;
        try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch (_) { return; }
        if (!target) return;
        event.preventDefault();
        nav.querySelector('details').open = false;
        history.pushState(null, '', link.hash);
        requestAnimationFrame(function () { target.scrollIntoView({ behavior: 'instant', block: 'start' }); });
      });
      post.insertBefore(nav, article);
    }
    if (post.querySelector('.article-mobile-nav')) article.querySelectorAll('details').forEach(function (details) {
      if (details.querySelector('summary')?.textContent.trim() === '本篇快速导航') details.classList.add('article-inline-nav');
    });
    // Fancybox links remain intact; existing handwritten captions take precedence.
    article.querySelectorAll('p').forEach(function (paragraph) {
      var image = paragraph.querySelector('img');
      if (!image || paragraph.querySelectorAll('img').length !== 1 || paragraph.textContent.trim() || !image.alt.trim()) return;
      var next = paragraph.nextElementSibling;
      if (next && (next.matches('figcaption,.article-image-caption') || (next.matches('p') && next.querySelector('em')))) return;
      if (paragraph.closest('figure,.tabs,.note,details')) return;
      var figure = document.createElement('figure');
      figure.className = 'article-image';
      paragraph.replaceWith(figure);
      while (paragraph.firstChild) figure.appendChild(paragraph.firstChild);
      var caption = document.createElement('figcaption');
      caption.textContent = image.alt;
      figure.appendChild(caption);
    });
    function updateRegions() {
      article.querySelectorAll('.table-wrap,.article-equation,mjx-container[display="true"]').forEach(function (region) {
        var overflow = region.scrollWidth > region.clientWidth + 2;
        region.classList.toggle('article-scroll-region', overflow);
        if (overflow) {
          region.setAttribute('tabindex', '0');
          region.setAttribute('role', 'region');
          region.setAttribute('aria-label', region.classList.contains('table-wrap') ? '表格，可左右滚动' : '公式，可左右滚动');
        } else if (region.getAttribute('role') === 'region') {
          region.removeAttribute('tabindex'); region.removeAttribute('role'); region.removeAttribute('aria-label');
        }
        if (region.classList.contains('table-wrap')) {
          var hint = region.previousElementSibling;
          if (!hint || !hint.classList.contains('article-table-hint')) {
            hint = document.createElement('p'); hint.className = 'article-table-hint';
            hint.textContent = '表格可左右滑动'; region.before(hint);
          }
          hint.hidden = !overflow;
        }
      });
    }
    updateRegions();
    if (window.ResizeObserver) {
      observer = new ResizeObserver(updateRegions);
      observer.observe(article);
    }
    mutations = new MutationObserver(function (records) {
      if (records.some(function (record) { return Array.from(record.addedNodes).some(function (node) {
        return node.nodeType === 1 && (node.matches('.table-wrap,table,mjx-container') || node.querySelector('.table-wrap,table,mjx-container'));
      }); })) updateRegions();
    });
    mutations.observe(article, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('pjax:complete', boot);
  window.addEventListener('load', boot);
})();

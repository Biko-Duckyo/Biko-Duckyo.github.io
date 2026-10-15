// Banner mouse parallax
(function () {
  function onMove(e) {
    if (window.innerWidth < 768) return;
    var h = document.getElementById('page-header');
    if (!h) return;
    var x = (e.clientX / window.innerWidth - 0.5) * 20;
    var y = (e.clientY / window.innerHeight - 0.5) * 10;
    h.style.backgroundPosition = 'calc(50% + ' + x + 'px) calc(50% + ' + y + 'px)';
  }
  document.addEventListener('mousemove', onMove);
})();

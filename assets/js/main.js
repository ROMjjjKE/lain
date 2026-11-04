/* ООО «Лайн Консталт»: меню, калькулятор сеток, заявка */

var WA = 'https://wa.me/375257833290';

document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initCalc();
  initForm();
  initYear();
});

function initMenu() {
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', function () {
    var open = menu.hidden;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1080 && !menu.hidden) {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

function initCalc() {
  var form = document.getElementById('calc');
  if (!form) return;

  var cw = document.getElementById('cw');
  var ch = document.getElementById('ch');
  var cq = document.getElementById('cq');
  var outPrice = document.getElementById('out-price');
  var outPer = document.getElementById('out-per');
  var outSize = document.getElementById('out-size');
  var outArea = document.getElementById('out-area');
  var outQty = document.getElementById('out-qty');
  var outTotal = document.getElementById('out-total');
  var outHint = document.getElementById('out-hint');
  var outWarn = document.getElementById('out-warn');
  var outSend = document.getElementById('out-send');

  var TYPES = { frame: 'Рамная', roll: 'Рулонная', plisse: 'Плиссе', slide: 'Раздвижная' };

  function val(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  function num(el, min, max, fallback) {
    var v = Math.round(Number(el.value));
    if (!isFinite(v) || v <= 0) v = fallback;
    if (v < min) v = min;
    if (v > max) v = max;
    return v;
  }

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function render() {
    var type = val('ctype') || 'frame';
    var fab = val('cfab') || 'Стандарт';
    var col = val('ccol') || 'Белый';
    var w = num(cw, 20, 400, 120);
    var h = num(ch, 20, 400, 140);
    var q = num(cq, 1, 30, 1);
    var area = (w * h) / 10000;

    outSize.textContent = w + ' × ' + h + ' см';
    outArea.textContent = area.toFixed(2).replace('.', ',') + ' м²';
    outQty.textContent = q + ' шт.';

    var warn = [];

    if (type !== 'frame') {
      outPrice.textContent = '—';
      outPer.textContent = 'считаем после замера: цена зависит от механизма';
      outTotal.textContent = 'по запросу';
      outHint.hidden = true;
      warn.push('Рулонные, плиссе и раздвижные сетки считаем индивидуально: отправьте размер, ответим ценой.');
    } else {
      var per = area <= 0.5 ? 20 : 40;
      var discounted = false;
      if (q >= 3 && area > 0.5) { per = 35; discounted = true; }

      outPrice.textContent = per;
      outPer.textContent = 'за сетку, с замером, доставкой и монтажом';
      outTotal.textContent = fmt(per * q) + ' р. за ' + q + ' шт.';
      outHint.hidden = false;
      outHint.textContent = discounted
        ? 'Скидка от 3 штук применена: 35 р. вместо 40 р. за сетку.'
        : 'Скидка от 3 штук: 35 р. за сетку вместо 40 р.';
      if (area <= 0.5) {
        outHint.textContent = 'Сетка до 0,5 м² идёт по минимальной цене 20 р.';
      }
    }

    if (fab !== 'Стандарт') warn.push('Полотно «' + fab + '» дороже стандартного: точную доплату назовём на замере.');
    if (col === 'По RAL') warn.push('Покраска по RAL: доплата зависит от оттенка.');

    if (warn.length) {
      outWarn.hidden = false;
      outWarn.textContent = warn.join(' ');
    } else {
      outWarn.hidden = true;
    }

    var msg = 'Здравствуйте! Расчёт с сайта:\n' +
      'Тип: ' + TYPES[type] + '\n' +
      'Размер: ' + w + ' × ' + h + ' см\n' +
      'Количество: ' + q + ' шт.\n' +
      'Полотно: ' + fab + '\n' +
      'Цвет: ' + col + '\n' +
      (type === 'frame' ? 'Предварительно: ' + outTotal.textContent : 'Нужна цена по размеру');
    outSend.href = WA + '?text=' + encodeURIComponent(msg);
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  render();
}

function initForm() {
  var form = document.getElementById('lead-form');
  if (!form) return;

  var ok = document.getElementById('form-ok');
  var okLink = document.getElementById('form-ok-link');
  var name = document.getElementById('f-name');
  var phone = document.getElementById('f-phone');
  var what = document.getElementById('f-what');
  var note = document.getElementById('f-note');

  function isPhone(v) {
    var d = v.replace(/\D/g, '');
    return d.length >= 9 && d.length <= 15;
  }

  [name, phone].forEach(function (el) {
    el.addEventListener('input', function () { el.setCustomValidity(''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!name.value.trim()) {
      name.setCustomValidity('Как к вам обращаться?');
      name.reportValidity();
      name.focus();
      return;
    }
    name.setCustomValidity('');

    if (!isPhone(phone.value)) {
      phone.setCustomValidity('Нужен номер для связи');
      phone.reportValidity();
      phone.focus();
      return;
    }
    phone.setCustomValidity('');

    var text = 'Заявка с сайта\n' +
      'Имя: ' + name.value.trim() + '\n' +
      'Телефон: ' + phone.value.trim() + '\n' +
      'Что нужно: ' + what.value +
      (note.value.trim() ? '\nДетали: ' + note.value.trim() : '');

    var url = WA + '?text=' + encodeURIComponent(text);
    okLink.href = url;
    form.hidden = true;
    ok.hidden = false;
    window.open(url, '_blank', 'noopener');
  });
}

function initYear() {
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}

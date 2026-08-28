! function(e) {
    var o = function() {
        var o = 65,
            t = '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"><span class="i18n" data-text="color-apply"></span></div></div>',
            r = {
                size: 255,
                eventName: "click",
                onShow: function() {},
                onBeforeShow: function() {},
                onHide: function() {},
                onChange: function() {},
                onSubmit: function() {},
                color: "ffffff",
                livePreview: !0,
                flat: !0
            },
            i = function(o, t) {
                var r = j(o);
                e(t).data("colorpicker").fields.eq(1).val(r.r).end().eq(2).val(r.g).end().eq(3).val(r.b).end()
            },
            c = function(o, t) {
				isNaN(o.h) && (o.h = 360);
                e(t).data("colorpicker").fields.eq(4).val(o.h).end().eq(5).val(o.s).end().eq(6).val(o.b).end()
            },
            a = function(o, t) {
                e(t).data("colorpicker").fields.eq(0).val(B(o)).end()
            },
            n = function(o, t) {
                e(t).data("colorpicker").selector.css("backgroundColor", "#" + B({
                    h: o.h,
                    s: 100,
                    b: 100
                })), e(t).data("colorpicker").selectorIndic.css({
                    left: parseInt(r.size * o.s / 100, 10),
                    top: parseInt(r.size * (100 - o.b) / 100, 10)
                })
            },
            l = function(o, t) {
                e(t).data("colorpicker").hue.css({
                    top: parseInt(r.size - r.size * o.h / 360, 10),
                    backgroundColor: "#" + B({
                        h: o.h,
                        s: 100,
                        b: 100
                    })
                })
            },
            d = function(o, t) {
                e(t).data("colorpicker").currentColor.css("backgroundColor", "#" + B(o))
            },
            s = function(o, t) {
                var r = "#" + B(o);
                e(t).data("colorpicker").newColor.css("backgroundColor", r), e(t).data("colorpicker").selectorIndic.css("backgroundColor", r)
            },
            p = function(t) {
                var r = t.charCode || t.keyCode || -1;
                if (r > o && 90 >= r || 32 == r) return !1;
                var i = e(this).parent().parent();
                i.data("colorpicker").livePreview === !0 && u.apply(this)
            },
            u = function(o) {
                var t, r = e(this).parent().parent();
				if (this.parentNode){
					this.parentNode.className.indexOf("_hex") > 0 ? r.data("colorpicker").color = t = D(T(this.value)) : this.parentNode.className.indexOf("_hsb") > 0 ? r.data("colorpicker").color = t = H({
						h: parseInt(r.data("colorpicker").fields.eq(4).val(), 10),
						s: parseInt(r.data("colorpicker").fields.eq(5).val(), 10),
						b: parseInt(r.data("colorpicker").fields.eq(6).val(), 10)
					}) : r.data("colorpicker").color = t = E(O({
						r: parseInt(r.data("colorpicker").fields.eq(1).val(), 10),
						g: parseInt(r.data("colorpicker").fields.eq(2).val(), 10),
						b: parseInt(r.data("colorpicker").fields.eq(3).val(), 10)
					})), o && (i(t, r.get(0)), a(t, r.get(0)), c(t, r.get(0))), n(t, r.get(0)), l(t, r.get(0)), s(t, r.get(0)), r.data("colorpicker").onChange.apply(r, [t, B(t), j(t)])
				}
            },
            f = function(o) {
                var t = e(this).parent().parent();
                t.data("colorpicker").fields.parent().removeClass("colorpicker_focus")
            },
            h = function() {
                var t = e(this);
                o = this.parentNode.className.indexOf("_hex") > 0 ? 70 : 65, t.parent().parent().data("colorpicker").fields.parent().removeClass("colorpicker_focus"), t.parent().addClass("colorpicker_focus"), setTimeout(function() {
                    t.select()
                })
            },
            v = function(o) {
                var t = e(this).parent().find("input").focus(),
                    r = {
                        el: e(this).parent().addClass("colorpicker_slider"),
                        max: this.parentNode.className.indexOf("_hsb_h") > 0 ? 360 : this.parentNode.className.indexOf("_hsb") > 0 ? 100 : 255,
                        y: o.pageY,
                        field: t,
                        val: parseInt(t.val(), 10),
                        preview: e(this).parent().parent().data("colorpicker").livePreview
                    };
                e(document).on("mouseup touchend", r, g), e(document).on("mousemove touchmove", r, m)
            },
            m = function(e) {
                return e.data.field.val(Math.max(0, Math.min(e.data.max, parseInt(e.data.val + e.pageY - e.data.y, 10)))), e.data.preview && u.apply(e.data.field.get(0), [!0]), !1
            },
            g = function(o) {
                return u.apply(o.data.field.get(0), [!0]), o.data.el.removeClass("colorpicker_slider").find("input").focus(), e(document).off("mouseup touchend", g), e(document).off("mousemove touchmove", m), !1
            },
            k = function(o) {
                o.preventDefault();
                var t = o;
                "undefined" != typeof event && event.touches && (t = event.touches[0]);
                var r = {
                    cal: e(this).parent(),
                    y: e(this).offset().top
                };
                return r.preview = r.cal.data("colorpicker").livePreview, e(document).on("mouseup touchend", r, x), e(document).on("mousemove touchmove", r, _), b(t, r, r.preview), !1
            },
            b = function(e, o, t) {
                u.apply(o.cal.data("colorpicker").fields.eq(4).val(parseInt(360 * (r.size - Math.max(0, Math.min(r.size, e.pageY - o.y))) / r.size, 10)).get(0), [t])
            },
            _ = function(e) {
                var o = e;
                return "undefined" != typeof event && event.touches && (o = event.touches[0]), b(o, e.data, e.data.preview), !1
            },
            x = function(o) {
                return i(o.data.cal.data("colorpicker").color, o.data.cal.get(0)), a(o.data.cal.data("colorpicker").color, o.data.cal.get(0)), e(document).off("mouseup touchend", x), e(document).off("mousemove touchmove", _), !1
            },
            w = function(o) {
                o.preventDefault();
                var t = {
                    cal: e(this).parent(),
                    pos: e(this).offset()
                };
                t.preview = t.cal.data("colorpicker").livePreview, e(document).on("mouseup touchend", t, C), e(document).on("mousemove touchmove", t, y), e(".colorpicker_color", t.cal).on("click", t, y), o.data = t, y(o)
            },
            y = function(e) {
                var o = e;
                return "undefined" != typeof event && event.touches && (o = event.touches[0]), u.apply(e.data.cal.data("colorpicker").fields.eq(6).val(parseInt(100 * (r.size - Math.max(0, Math.min(r.size, o.pageY - e.data.pos.top))) / r.size, 10)).end().eq(5).val(parseInt(100 * Math.max(0, Math.min(r.size, o.pageX - e.data.pos.left)) / r.size, 10)).get(0), [e.data.preview]), !1
            },
            C = function(o) {
                return i(o.data.cal.data("colorpicker").color, o.data.cal.get(0)), a(o.data.cal.data("colorpicker").color, o.data.cal.get(0)), e(document).off("mouseup touchend", C), e(document).off("mousemove touchmove", y), !1
            },
            M = function(o) {
                e(this).addClass("colorpicker_focus")
            },
            I = function(o) {
                e(this).removeClass("colorpicker_focus")
            },
            z = function(o) {
                var t = e(this).parent(),
                    i = t.data("colorpicker").color;
                t.data("colorpicker").origColor = i, d(i, t.get(0)), "function" == typeof r.onSubmit && r.onSubmit(i, B(i), j(i), t.data("colorpicker").el)
            },
            q = function(o) {
                var t = e("#" + e(this).data("colorpickerId"));
                t.data("colorpicker").onBeforeShow.apply(this, [t.get(0)]);
                var r = e(this).offset(),
                    i = N(),
                    c = r.top + this.offsetHeight,
                    a = r.left;
                return c + 176 > i.t + i.h && (c -= this.offsetHeight + 176), a + 356 > i.l + i.w && (a -= 356), t.css({
                    left: a + "px",
                    top: c + "px"
                }), 0 != t.data("colorpicker").onShow.apply(this, [t.get(0)]) && t.show(), e(document).on("mousedown touchstart", {
                    cal: t
                }, P), !1
            },
            P = function(o) {
                S(o.data.cal.get(0), o.target, o.data.cal.get(0)) || (0 != o.data.cal.data("colorpicker").onHide.apply(this, [o.data.cal.get(0)]) && o.data.cal.hide(), e(document).off("mousedown touchstart", P))
            },
            S = function(e, o, t) {
                if (e == o) return !0;
                if (e.contains) return e.contains(o);
                if (e.compareDocumentPosition) return !!(16 & e.compareDocumentPosition(o));
                for (var r = o.parentNode; r && r != t;) {
                    if (r == e) return !0;
                    r = r.parentNode
                }
                return !1
            },
            N = function() {
                var e = "CSS1Compat" == document.compatMode;
                return {
                    l: window.pageXOffset || (e ? document.documentElement.scrollLeft : document.body.scrollLeft),
                    t: window.pageYOffset || (e ? document.documentElement.scrollTop : document.body.scrollTop),
                    w: window.innerWidth || (e ? document.documentElement.clientWidth : document.body.clientWidth),
                    h: window.innerHeight || (e ? document.documentElement.clientHeight : document.body.clientHeight)
                }
            },
            H = function(e) {
                return {
                    h: Math.min(360, Math.max(0, e.h)),
                    s: Math.min(100, Math.max(0, e.s)),
                    b: Math.min(100, Math.max(0, e.b))
                }
            },
            O = function(e) {
                return {
                    r: Math.min(255, Math.max(0, e.r)),
                    g: Math.min(255, Math.max(0, e.g)),
                    b: Math.min(255, Math.max(0, e.b))
                }
            },
            T = function(e) {
                var o = 6 - e.length;
                if (o > 0) {
                    for (var t = [], r = 0; o > r; r++) t.push("0");
                    t.push(e), e = t.join("")
                }
                return e
            },
            Y = function(e) {
                var e = parseInt(e.indexOf("#") > -1 ? e.substring(1) : e, 16);
                return {
                    r: e >> 16,
                    g: (65280 & e) >> 8,
                    b: 255 & e
                }
            },
            D = function(e) {
                return E(Y(e))
            },
            E = function(e) {
                var o = {
                        h: 0,
                        s: 0,
                        b: 0
                    },
                    t = Math.min(e.r, e.g, e.b),
                    r = Math.max(e.r, e.g, e.b),
                    i = r - t;
                return o.b = r, o.s = 0 != r ? 255 * i / r : 0, 0 != o.s ? e.r == r ? o.h = (e.g - e.b) / i : e.g == r ? o.h = 2 + (e.b - e.r) / i : o.h = 4 + (e.r - e.g) / i : o.h = -1, o.h *= 60, e.r === e.g && e.g === e.b ? o.h = 360 : o.h < 0 && (o.h += 360), o.s *= 100 / 255, o.b *= 100 / 255, o
            },
            j = function(e) {
                var o = {},
                    t = Math.round(e.h),
                    r = Math.round(255 * e.s / 100),
                    i = Math.round(255 * e.b / 100);
                if (0 == r) o.r = o.g = o.b = i;
                else {
                    var c = i,
                        a = (255 - r) * i / 255,
                        n = (c - a) * (t % 60) / 60;
                    360 == t && (t = 0), 60 > t ? (o.r = c, o.b = a, o.g = a + n) : 120 > t ? (o.g = c, o.b = a, o.r = c - n) : 180 > t ? (o.g = c, o.r = a, o.b = a + n) : 240 > t ? (o.b = c, o.r = a, o.g = c - n) : 300 > t ? (o.b = c, o.g = a, o.r = a + n) : 360 > t ? (o.r = c, o.g = a, o.b = c - n) : (o.r = 0, o.g = 0, o.b = 0)
                }
                return {
                    r: Math.round(o.r),
                    g: Math.round(o.g),
                    b: Math.round(o.b)
                }
            },
            W = function(o) {
                var t = [o.r.toString(16), o.g.toString(16), o.b.toString(16)];
                return e.each(t, function(e, o) {
                    1 == o.length && (t[e] = "0" + o)
                }), t.join("")
            },
            B = function(e) {
                return W(j(e))
            },
            L = function() {
                var o = e(this).parent(),
                    t = o.data("colorpicker").origColor;
                o.data("colorpicker").color = t, i(t, o.get(0)), a(t, o.get(0)), c(t, o.get(0)), n(t, o.get(0)), l(t, o.get(0)), s(t, o.get(0))
            };
        return {
            init: function(o) {
                if (o = e.extend({}, r, o || {}), "string" == typeof o.color) o.color = D(o.color);
                else if (void 0 != o.color.r && void 0 != o.color.g && void 0 != o.color.b) o.color = E(o.color);
                else {
                    if (void 0 == o.color.h || void 0 == o.color.s || void 0 == o.color.b) return this;
                    o.color = H(o.color)
                }
                return this.each(function() {
                    if (!e(this).data("colorpickerId")) {
                        var r = e.extend({}, o);
                        r.origColor = o.color;
                        var m = "collorpicker_" + parseInt(1e3 * Math.random());
                        e(this).data("colorpickerId", m);
                        var g = e(t).attr("id", m);
                        r.flat ? g.appendTo(this).show() : g.appendTo(document.body), r.fields = g.find("input").on("keyup", p).on("change", u).on("blur", f).on("focus", h), g.find("span").on("mousedown touchstart", v).end().find(">div.colorpicker_current_color").on("click", L), r.selector = g.find("div.colorpicker_color").on("mousedown touchstart", w), r.selectorIndic = r.selector.find("div div"), r.el = this, r.hue = g.find("div.colorpicker_hue div"), g.find("div.colorpicker_hue").on("mousedown touchstart", k), r.newColor = g.find("div.colorpicker_new_color"), r.currentColor = g.find("div.colorpicker_current_color"), g.data("colorpicker", r), g.find("div.colorpicker_submit").on("mouseenter touchstart", M).on("mouseleave touchend", I).on("click", z), i(r.color, g.get(0)), c(r.color, g.get(0)), a(r.color, g.get(0)), l(r.color, g.get(0)), n(r.color, g.get(0)), d(r.color, g.get(0)), s(r.color, g.get(0)), r.flat ? g.css({
                            position: "relative",
                            display: "block"
                        }) : e(this).on(r.eventName, q)
                    }
                })
            },
            showPicker: function() {
                return this.each(function() {
                    e(this).data("colorpickerId") && q.apply(this)
                })
            },
            hidePicker: function() {
                return this.each(function() {
                    e(this).data("colorpickerId") && e("#" + e(this).data("colorpickerId")).hide()
                })
            },
            setColor: function(o) {
                if ("string" == typeof o) o = D(o);
                else if (void 0 != o.r && void 0 != o.g && void 0 != o.b) o = E(o);
                else {
                    if (void 0 == o.h || void 0 == o.s || void 0 == o.b) return this;
                    o = H(o)
                }
                return this.each(function() {
                    if (e(this).data("colorpickerId")) {
                        var t = e("#" + e(this).data("colorpickerId"));
                        t.data("colorpicker").color = o, t.data("colorpicker").origColor = o, i(o, t.get(0)), c(o, t.get(0)), a(o, t.get(0)), l(o, t.get(0)), n(o, t.get(0)), d(o, t.get(0)), s(o, t.get(0))
                    }
                })
            },
            submit: function(e) {
                r.onSubmit = e
            }
        }
    }();
    e.fn.extend({
        ColorPicker: o.init,
        ColorPickerHide: o.hidePicker,
        ColorPickerShow: o.showPicker,
        ColorPickerSetColor: o.setColor,
        ColorPickerSubmit: o.submit
    })
}(jQuery);
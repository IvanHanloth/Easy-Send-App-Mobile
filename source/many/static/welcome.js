layui.use(function () {
	var carousel = layui.carousel,
		layer = layui.layer,
		form = layui.form;
	carousel.render({
		elem: '#welcome-carousel',
		autoplay: false,
		arrow: 'hover',
		anim: 'default',
		indicator: 'none',
		full: true
	});
	$("#main_url").val(window.localStorage.getItem("main_url"))
	form.on('submit(web_url)', function (data) {
		web_pre_url = data.field.former_url + data.field.main_url
		window.localStorage.setItem("main_url",data.field.main_url)
		$.ajax({
			type: "GET",
			url: web_pre_url + "/public/api/set_info.php",
			dataType: "json",
			beforeSend: function (xhr) {
				$("[lay-type='add']").click()
			},
			success: function (res) {
				if(res.code == 200) {
					a = setTimeout(function () {
						$("[lay-type='add']").click()
					}, 2000)
				} else {
					a = setTimeout(function () {
						$("[lay-type='sub']").click();
						layer.msg("无法连接至网站服务器", {
							time: 2000
						})
					}, 2000)
				}
			},
			error: function () {
				a = setTimeout(function () {
					$("[lay-type='sub']").click();
					layer.msg("无法连接至网站服务器", {
						time: 2000
					})
				}, 2000)
			}
		})
		return false;
	});
});
$("#continue").click(function () {
	$("[lay-type='add']").click()
})
$("#start_use").click(function () {
	$("[lay-type='add']").click()
	window.localStorage.setItem("web_url", web_pre_url)
	setTimeout(function () {
		window.location.href = "./main.html"
	}, 3000)
})

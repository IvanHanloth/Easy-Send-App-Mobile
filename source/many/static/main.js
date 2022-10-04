/*
全局变量定义区
*/
room_info = 0;
all_blob = [];
save_lock = 1;
web_pre_url = "";
plateform="";
version_num="";
version="";
web_url = window.localStorage.getItem("web_url")
if(web_url == null) {
	window.location.href = "./welcome.html"
} else {
	$.ajax({
		type: "GET",
		url: web_url + "/public/api/set_info.php",
		dataType: "json",
		success: function (res) {
			if(res.code == 200) {} else {
				layer.msg("无法连接至服务器，正在前往配置页面", {
					end: function () {
						window.location.href = "./welcome.html"
					}
				})
			}
		},
		error: function () {
			layer.msg("无法连接至服务器，正在前往配置页面", {
				end: function () {
					window.location.href = "./welcome.html"
				}
			})
		}
	})
	
    //检查更新
    layui.use(function(){
        var layer=layui.layer;
    $.getJSON("./config.json",function(value){
        plateform=value.plateform;
        version_num=value.version_num;
        version=value.version;
        $.getJSON(web_url+"/public/api/set_info.php",function(result){
            if(version_num!=result.PC.version_num){
                if(plateform=="windows"){
                    updateurl=result.PC.windows_url
                }else if(plateform=="mac"){
                    updateurl=result.PC.mac_url
                }
                btnarray=['立即更新']
                if(result.mobile.must=="off"){
                    btnarray.push("下次再说")
                }
                layer.open({
                  title: '发现新版本！'
                  ,type:0
                  ,closeBtn:0
                  ,btn: btnarray
                  ,btnAlign: 'c'
                  ,area:["60%","75%"]
                  ,content: '当前版本： '+version+'<br>最新版本： '+result.PC.version+'<br>更新说明：'+result.PC.update_description
                  ,yes:function(){
                      window.location.href=updateurl
                      return false;
                  }
                });     
      
            }
        })
    })
    })
	layui.use(function () {
		var form = layui.form,
			$ = layui.jquery,
			element = layui.element,
			layer = layui.layer;
		$("#change_web_url").click(function () {
			layer.confirm("该操作会清除当前提供服务的网站地址", {
				title: "提示"
			}, function (index) {
				window.localStorage.removeItem("web_url")
				window.location.reload()
			})
		})
		//监听提交
		form.on('submit(roombtn)', function (data) {
			$.ajax({
				//定义提交的方式
				type: "POST",
				//定义要提交的URL
				url: web_url + '/public/api/room_attend.php',
				//定义提交的数据类型
				dataType: 'json',
				async: true,
				//要传递的数据
				data: {
					"data": JSON.stringify(data.field),
					"step": "input"
				},
				//服务器处理成功后传送回来的json格式的数据
				success: function (res) {
					if(res.code == 200) {
						$("#room_input").addClass("layui-hide");
						$("#room_choose").removeClass("layui-hide");
						$("#room_info").removeClass("layui-hide");
						$("#room_roomid").html(res.roomid);
						if(res.type == "send") {
							mytype = "发送端"
						} else if(res.type == "receive") {
							mytype = "接收端"
						} else {
							mytype = "神秘人"
						}
						$("#room_type").html(mytype);
						$("#room_state").html(res.state)
						layer.msg(res.tip, {
							icon: 1
						});
						data_check()
					} else {
						if(res.code == 100) {
							layer.msg(res.tip, {
								icon: 2
							});
						} else {
							layer.msg("出现异常", {
								icon: 2
							})
						}
					}
				},
				error: function () {
					layer.msg('出现异常，请重试', {
						icon: 2
					});
				}
			});
			return false;
		});
		$("#room_choose_send").click(function () {
			$.ajax({
				//定义提交的方式
				type: "POST",
				//定义要提交的URL
				url: web_url + '/public/api/room_attend.php',
				//定义提交的数据类型
				dataType: 'json',
				async: true,
				//要传递的数据
				data: {
					"type": "send",
					"step": "choose"
				},
				//服务器处理成功后传送回来的json格式的数据
				success: function (res) {
					if(res.code == 200) {
						$("#room_choose").addClass("layui-hide");
						$("#room_send").removeClass("layui-hide");
						layer.msg(res.tip, {
							icon: 1
						})
					} else {
						layer.msg(res.tip, {
							icon: 2
						})
					}
				},
				error: function () {
					layer.msg('出现异常，请重试', {
						icon: 2
					});
				}
			});
		})
		$("#room_choose_receive").click(function () {
			$.ajax({
				type: "POST",
				url: web_url + '/public/api/room_attend.php',
				dataType: 'json',
				async: true,
				//要传递的数据
				data: {
					"type": "receive",
					"step": "choose"
				},
				//服务器处理成功后传送回来的json格式的数据
				success: function (res) {
					if(res.code == 200) {
						$("#room_choose").addClass("layui-hide");
						$("#room_receive").removeClass("layui-hide");
						room_receive()
						layer.msg(res.tip, {
							icon: 1
						})
					} else {
						layer.msg(res.tip, {
							icon: 2
						})
					}
				},
				error: function () {
					layer.msg('出现异常，请重试', {
						icon: 2
					});
				}
			});
		})
		$("#room_send_button_continue").click(function () {
			$("#room_choose").removeClass("layui-hide");
			$("#room_send").addClass("layui-hide");
		})
		$("#room_send_button").click(function () {
			$("#room_send_file").click();
			Send_Select()
		})
	})

	function Send_Select() {
		Send_Select_time = setTimeout(function () {
			if($("#room_send_file").val() == "") {
				Send_Select()
			} else {
				$("#room_send_button_confirm").removeClass("layui-hide")
				$("#room_send_file_info").removeClass("layui-hide")
				file = $("#room_send_file")[0].files[0]
				name = file.name
				if(name.length > 11) {
					name = name.substr(0, 11) + "…"
				}
				size = (file.size / (1024 * 1024)).toFixed(2)
				$("#room_send_file_name").html(name)
				$("#room_send_file_size").html(size)
				clearTimeout(Send_Select_time)
			}
		}, 100)
	}

	function room_upload(index) {
		layui.use(function () {
			layer = layui.layer
			element = layui.element
			if(index == 0) {
				layer.msg("正在发送…", {
					icon: 21,
					time: 2000
				})
				clearTimeout(statetime)
				data_check()
				$("#room_send_sending").removeClass("layui-hide")
				$("#room_send_connected").addClass("layui-hide")
			}
			sliceSize = (1024 * 1024) * 0.5; //切片0.5M
			xhr = new XMLHttpRequest();
			const file = $("#room_send_file")[0].files[0]
			const name = file.name
			const size = file.size
			const total = Math.ceil(size / sliceSize)
			start = index * sliceSize
			end = start + sliceSize
			if(start >= size) {
				clearTimeout(statetime)
				data_check()
				$("#room_send_connected").addClass("layui-hide")
				$("#room_send_sending").addClass("layui-hide")
				$("#room_send_finish").removeClass("layui-hide")
				layer.msg("直传成功", {
					icon: 1,
					shade: 0.3,
					time: 2000
				})
				return true
			}
			if(end >= size) {
				end = size
			}
			progress = Number((end / size).toFixed(2)) * 100 + "%"
			blob = file.slice(start, end)
			sliced = new File([blob], index + name)
			form = new FormData()
			form.append("file", sliced)
			form.append("index", index + 1)
			form.append("total", total)
			form.append("size", size)
			form.append("origin", name)
			xhr.open("post", web_url + "/public/api/room_upload.php", true) //发送请求
			xhr.send(form) //携带集合    
			xhr.onreadystatechange = function () {
				if(this.readyState === 4 && this.status === 200) {
					element.progress("room_progress", progress)
					room_upload(index + 1);
				}
			};
		})
	}

	function data_check() {
		statetime = setTimeout(function () {
			$.getJSON(web_url + "/public/api/room_info.php", function (data) {
				$("#room_roomid").html(data.roomid);
				if(data.type == "send") {
					mytype = "发送端"
				} else if(data.type == "receive") {
					mytype = "接收端"
				} else {
					mytype = "神秘人"
				}
				$("#room_type").html(mytype);
				$("#room_state").html(data.state)
				if($("#room_qrcode").attr("src") != data.qrcode) {
					$("#room_qrcode").attr("src", data.qrcode)
				}
				if(data.type == "send") {
					if(data.state == "connected" && $("#room_send_file").val() == "") {
						$("#room_send_connected").removeClass("layui-hide")
						$("#room_send_finish").addClass("layui-hide")
						$("#room_send_sending").addClass("layui-hide")
					} else if(data.state == "sending") {
						$("#room_send_finish").addClass("layui-hide")
						$("#room_send_connected").addClass("layui-hide")
						$("#room_send_sending").removeClass("layui-hide")
					} else if(data.state == "send-finish" || data.state == "finish") {
						$("#room_send_connected").addClass("layui-hide")
						$("#room_send_sending").addClass("layui-hide")
						$("#room_send_finish").removeClass("layui-hide")
					}
				} else if(data.type == "receive") {
					if(data.state == "connected") {
						$("#room_receive_connected").removeClass("layui-hide")
						$("#room_receive_finish").addClass("layui-hide")
						$("#room_receive_sending").addClass("layui-hide")
						localforage.clear()
					} else if(data.state == "sending") {
						$("#room_receive_finish").addClass("layui-hide")
						$("#room_receive_connected").addClass("layui-hide")
						$("#room_receive_sending").removeClass("layui-hide")
					} else if(data.state == "finish") {
						$("#room_receive_connected").addClass("layui-hide")
						$("#room_receive_sending").addClass("layui-hide")
						$("#room_receive_finish").removeClass("layui-hide")
					} else if(data.state == "send-finish") {
						$("#room_receive_connected").addClass("layui-hide")
						$("#room_receive_sending").addClass("layui-hide")
						$("#room_receive_finish").removeClass("layui-hide")
					}
				}
				room_info = data;
			})
			data_check()
		}, 3000);
	}

	function room_receive() {
		room_receive_time = setTimeout(function () {
			$.getJSON(web_url + "/public/api/room_download.php", function (data) {
				if(room_info.state == "waiting" || room_info.state == "connected") {
					all_blob = [];
					localforage.clear().then(function () {
						save_lock = 1;
					}).catch(function (err) {
						console.log(err)
					})
				} else {
					if(data.code != 100) {
						data.forEach(function (content, index) {
							localforage.getItem(String(content.num), function (err, value) {
								if(value == null) {
									var xhr = new XMLHttpRequest();
									xhr.open("GET", content.url, true); //open false 是同步请求，不会异步触发
									xhr.responseType = 'blob';
									xhr.onload = function () {
										localforage.setItem(String(content.num), xhr.response)
									};
									xhr.send();
								} else {
									localforage.length().then(function (length) {
										if(length == room_info.total) {
											function blob_save(index) {
												layui.use(function () {
													var layer = layui.layer
													if(index == "lock") {} else {
														if(index > room_info.total) {
															save_blob = new Blob(all_blob);
															if(window.navigator.msSaveOrOpenBlob) {
																navigator.msSaveBlob(save_blob, room_info.origin);
															} else {
																var link = document.createElement('a');
																var body = document.querySelector('body');
																link.href = window.URL.createObjectURL(save_blob);
																link.download = room_info.origin;
																// fix Firefox 
																link.style.display = 'none';
																body.appendChild(link);
																link.click();
																body.removeChild(link);
																window.URL.revokeObjectURL(link.href);
															};
															$.ajax({
																type: "POST",
																url: web_url + "/public/api/room_download.php",
																data: {
																	"state": "finish"
																},
																success: function (res) {
																	layer.msg("直传完成", {
																		icon: 1,
																		time: 2000,
																		shade: 0.3
																	})
																	localforage.clear()
																	clearTimeout(statetime)
																	data_check()
																},
																error: function () {
																	layer.msg("直传出错", {
																		icon: 2,
																		time: 2000,
																		shade: 0.3
																	})
																	clearTimeout(statetime)
																	data_check()
																}
															})
														} else {
															localforage.getItem(String(index)).then(function (value) {
																//all_blob.push(value);
																all_blob[Number(index)] = value
																blob_save(index + 1);
															}).catch(function (err) {
																// 当出错时，此处代码运行
																console.log(err)
															});
														}
													}
												})
											}
											blob_save(save_lock)
											save_lock = "lock"
										}
									})
								}
							})
						})
					}
				}
			})
			room_receive()
		}, 1500)
	}

	function GetContinue() {
		$("#get-input").val("");
		$("#input").removeClass("layui-hide");
		$("#result").addClass("layui-hide");
		$("#result-download-btn").addClass("layui-hide");
		$("#result-file").addClass("layui-hide");
		$("#result-info").addClass("layui-hide");
		$("#result-text").addClass("layui-hide");
	}
	layui.use(function () {
		var form = layui.form,
			$ = layui.jquery,
			element = layui.element,
			flow = layui.flow,
			layer = layui.layer;
		flow.lazyimg();
		$.getJSON(web_url + "/public/api/set_info.php", function (result) { //获取文件上传大小等
			var uploadsize = result.filesize;
			/*
			获取数据
			*/
			form.verify({
				get: function (value) {
					if(value.length != 4) {
						return '提取码为4位';
					}
				}
			});
			//监听提交
			form.on('submit(getbtn)', function (data) {
				$.ajax({
					//定义提交的方式
					type: "POST",
					//定义要提交的URL
					url: web_url + '/public/api/get_data.php',
					//定义提交的数据类型
					dataType: 'json',
					async: false,
					//要传递的数据
					data: {
						'key': JSON.stringify(data.field)
					},
					//服务器处理成功后传送回来的json格式的数据
					success: function (res) {
						if(res.code == 200) { //返回存在该提取码
							$("#input").addClass("layui-hide");
							layer.msg("获取成功", {
								icon: 1
							});
							$("#result").removeClass("layui-hide");
							$("#result-info").removeClass("layui-hide");
							$("#get-leave-times").html(res.times);
							$("#get-leave-tillday").html(res.tillday);
							if(res.type == 1) { //为文件型
								$("#result-download-btn").removeClass("layui-hide");
								$("#result-file").removeClass("layui-hide");
								$("#result-url").attr("value", res.data);
								$("#result-download").attr("href", res.data);
							} else {
								if(res.type == 2) { //为文本型
									$("#result-text").removeClass("layui-hide");
									$("#result-value").val(res.data);
								}
							}
						} else { //返回不存在该提取码
							layer.msg(res.tip, {
								icon: 2
							});
						}
					},
					error: function () {
						layer.msg('出现异常，请重试', {
							icon: 2
						});
					}
				});
				return false;
			});
		});
	})

	function FileContinue() {
		$('#upload').removeClass('layui-hide');
		$('#upload-Action').removeClass('layui-hide');
		$('#reload-tip').addClass('layui-hide');
		$('#upload-info').addClass('layui-hide');
		$('#upload-progress').addClass('layui-hide');
		$("#local-info").addClass('layui-hide');
		$('#file-info').addClass("layui-hide");
		$("#file-qrcode").attr("src", "./static/placeholder.svg")
		layui.use(function () {
			uploader.reload()
		})
	}
	layui.use(function () {
		var form = layui.form,
			$ = layui.jquery,
			element = layui.element,
			upload = layui.upload,
			layer = layui.layer;
		$.getJSON(web_url + "/public/api/set_info.php", function (result) { //获取文件上传大小等
			var uploadsize = result.filesize
			$("#upload-size-info").html("<p>文件最大" + uploadsize / (1024 * 1024) + "MB</p>");
			/*
			上传文件
			*/
			var uploader = upload.render({
				elem: '#upload',
				auto: false,
				accept: 'file',
				bindAction: '#upload-Action',
				size: uploadsize / 1024,
				url: web_url + '/public/api/upload_file.php',
				choose: function (obj) {
					element.progress('progress', '0%'); //进度条复位
					var files = this.files = obj.pushFile();
					obj.preview(function (index, file, result) {
						if(file.name.length > 10) {
							var filename = file.name.substring(0, 10) + " ...";
						} else {
							var filename = file.name;
						}
						$("#local-info").html('文件名称：' + filename + '&nbsp;&nbsp;文件大小：' + (file.size / 1048517).toFixed(1) + 'Mb');
					});
					$('#upload-info').removeClass('layui-hide');
					$('#upload-progress').removeClass('layui-hide');
					$("#local-info").removeClass('layui-hide');
				},
				before: function (obj) {
					element.progress('progress', '0%'); //进度条复位
					layer.msg('上传中', {
						icon: 16,
						time: 0
					});
					layui.$('#upload-progress').removeClass('layui-hide');
					$('#upload-Action').addClass('layui-hide');
					$('#key').html('');
				},
				done: function (res, index, upload) {
					//假设code=0代表上传成功
					if(res.code == 200) {
						$('#upload').addClass('layui-hide');
						$('#upload-Action').addClass('layui-hide');
						$('#reload-tip').addClass('layui-hide');
						$("#file-info").removeClass("layui-hide");
						$("#file-qrcode").attr("src", res.qrcode);
						$("#file-leave-times").html(res.times)
						$("#file-leave-tillday").html(res.tillday)
						$("#file-code").html(res.key);
						layer.msg('上传完毕', {
							icon: 1
						});
					}
					//上传成功的一些操作
					//…… //置空上传失败的状态
				},
				error: function () {
					layer.msg('出现异常，请重试', {
						icon: 2
					});
					$('#reload-tip').removeClass('layui-hide');
					$('#reload-tip').find('#reload').on('click', function () {
						uploader.upload();
					});
				},
				progress: function (n, elem, e) {
					element.progress('progress', n + '%'); //可配合 layui 进度条元素使用
				}
			});
		})
	})

	function TextContinue() {
		$("#text-info").addClass("layui-hide");
		$('#text').removeClass('layui-hide');
		$('#text-btn').removeClass('layui-hide');
		$('#text-textarea').val('');
		$("#text-qrcode").attr("src", "./static/placeholder.svg")
	}
	layui.use(function () {
		var form = layui.form,
			$ = layui.jquery,
			element = layui.element,
			upload = layui.upload,
			flow = layui.flow,
			layer = layui.layer;
		flow.lazyimg();
		$.getJSON(web_url + "/public/api/set_info.php", function (result) { //获取文件上传大小等
			var textsize = result.textsize
			/*
			保存文本
			*/
			form.verify({
				text: function (value) {
					if(value.length > textsize) {
						return '文本不能超过' + textsize + '字符';
					}
				}
			});
			//监听提交
			form.on('submit(save)', function (data) {
				$.ajax({
					//定义提交的方式
					type: "POST",
					//定义要提交的URL
					url: web_url + '/public/api/save_text.php',
					//定义提交的数据类型
					dataType: 'json',
					async: false,
					//要传递的数据
					data: {
						'data': JSON.stringify(data.field)
					},
					//服务器处理成功后传送回来的json格式的数据
					success: function (res) {
						if(res.code == 200) {
							$('#text').addClass('layui-hide');
							$('#text-btn').addClass('layui-hide');
							$("#text-info").removeClass("layui-hide");
							$("#text-qrcode").attr("src", res.qrcode);
							$("#text-leave-times").html(res.times)
							$("#text-leave-tillday").html(res.tillday)
							$("#text-code").html(res.key);
							$('#text-btn').addClass('layui-hide');
							layer.msg('上传完毕', {
								icon: 1
							});
						}
					},
					error: function () {
						layer.msg('出现异常，请重试', {
							icon: 2
						});
					}
				});
				return false;
			});
		});
	});
}

window.jb_domain = {
    system_config: {
        iframe_1_docu:null,
        iframe_2_docu: null,
        iframe_1_window: null,
        iframe_2_window: null,
        lock: false,  ///  是否已经全部初始化完毕
        m_video: null,
        m_video_obj: [],
        isPaused:false,
        that: null,
        current_section:0, // 当前章节
        is_answer:false,
        section_count:0, ///  所有的章节数量
        cells:null,
        a_list: [],
        section_list:[],
        problem_ele:null,
        problem:"",  //  存储题
        play_btn: null,
        show_div: null,
        show_div_box: null,
        command_box: null,
        is_right:false,
        isPlay:false,
        is_click:false,
        options: "",
        already_select_index:0,
        problem_type: -1,
        current_video_index:0, // 播放到第几个视频了
        current_page_video_list:[],  /// 当前页视频列表
        current_page_video_count:0,
        is_monual_select:false,  //  用户是否自己选了
        navigation_bar:null,
        isHasCheck:false,
        is_chaoxing:false,
        submit_btn: null,
        isClickNavInit:false, 
        isClickNav: true,   /// 是否点击导航栏
        current_page_video_states:[],  /// 存储当前页所有视频的播放状态
        completed_str: "所有视频都播放完了，感谢您对这个脚本的认可,三克油",
        timeouts:{},    //  存储定时器
        colors:{
            system_error: "#f40",
            system_warning: "#3399FF",
            system_default: "#fff",
            system_tip: "#99ff00",
            system_log: "#cccccc",
            user_defined: "#CC9900" // 用户自己定义
        },
    },
    user_config: {
        isAutoPlay: false,  // 是否运行脚本后就自动播放
        isRate:false,  ///  是否倍速
        rate:2,  ///  倍速的速率
        is_auto_answer:true,  // 是否自动答题
        m_video_volume: 0,  ///  默认视频音量(0 -- 1小数)
        isPlayHasWatchedVideo: true,  // 是否播放已经看过的视频
    },

    init_base(){
        // 只要初始化一次的放这里
        this.system_config.that = this;
        this.createBox();
        this.isChaoXing();
        window.system_alert = window.alert;
        this.hijackAlert();
        if(this.system_config.is_chaoxing){
            this.appendChildToInputDiv("友情提示: 请不要最小化浏览器，保持浏览器打开", this.system_config.colors.system_warning);
            this.getInfo();
        }else{
            this.appendChildToInputDiv("不是超星通网址，谢谢", this.system_config.colors.system_error);
        }
       
    },
    fixedShowDivLocation(){
        let selector = document.getElementById("selector");
        let left = parseInt(getComputedStyle(selector).left);
        let right = parseInt(getComputedStyle(selector).right);
        if(left > right){
            //  在右侧
            this.system_config.show_div_box.style.left = "20px";
        }else{
            ///  在左侧
            let left_num = parseInt(document.body.clientWidth) - parseInt(getComputedStyle(this.system_config.show_div_box).width) - 20;
            if(left_num > 0){
                this.system_config.show_div_box.style.left = left_num + "px";
            }else{
                this.system_config.show_div_box.style.left = "0px";
            }
        }
    },
    getInfo(){
        this.system_config.cells = document.getElementsByClassName("cells");
        this.system_config.section_list = document.getElementsByClassName("ncells");
        this.system_config.navigation_bar = document.getElementById("content1");
        this.fixedShowDivLocation();
        this.get_current_section();
        this.getAllLink();
        this.getSectionCount();
        this.addMyEventListener();
        if(this.user_config.isAutoPlay){
            this.jb();
        }else{
            this.appendChildToInputDiv("您关闭了自动开始播放, 回复1开始播放", this.system_config.colors.system_tip);
        }
    },
    addMyEventListener(){
        //  添加右侧导航栏监听事件
        this.system_config.navigation_bar.addEventListener("click", function(e){
            let is_mis_click = e.target.className.search("knowledgeOpenBtn") !== -1;
            if(!is_mis_click){
                if(e.target === jb_domain.system_config.section_list[jb_domain.system_config.current_section].querySelector("a")){
                    //  滚动导航栏
                    jb_domain.scrollNavBar(e);
                }else{
                    //  用户点了导航栏
                    jb_domain.appendChildToInputDiv("您点击了导航栏，脚本已停止，回复 1 恢复", jb_domain.system_config.colors.system_warning);
                    jb_domain.stopJb();
                    setTimeout(function(){
                        /// 1.5s后判断用户是否成功点击
                        let i = jb_domain.get_current_section(false);
                        let isSuccess = jb_domain.isSuccessClickNav(i);
                        if(isSuccess !== null && isSuccess){
                            jb_domain.system_config.isClickNav = false;
                            jb_domain.system_config.isClickNavInit = true;
                        }else{
                            jb_domain.system_config.isClickNavInit = false;
                            jb_domain.system_config.isClickNav = true;
                        }
                        jb_domain.system_config.lock = false;  // 解锁  
                    }, 1500);
                }
            }
        });
    },
    isChaoXing(){
        let href = window.location.href;
        this.system_config.is_chaoxing = href.search("chaoxing.com") !== -1 ? true : false;
    },
    scrollNavBar(e){
        //  滚动导航栏
        let nav = this.system_config.navigation_bar;
        let nav_height = nav.scrollHeight;  //  总高度
        let client_height = nav.clientHeight;  // 这个元素在客户端的高度
        let nav_half_height = parseInt(client_height / 2);  // 客户端一半高度
        let has_scroll_height = nav.scrollTop;  //  已经滚的高度
        let e_t = e.target.getBoundingClientRect().top;  //  元素距离父元素顶部高度
        let ele_top = parseInt(e_t + has_scroll_height);  // 当前元素所处的高度
        if(ele_top <= nav_half_height){
            ///  元素的高度小于客户端的一半，滚一个客户端高度一半的随机值
            let scroll_height = parseInt(Math.random() * (ele_top - 10));
            nav.scrollTo(0, scroll_height);
        }else if(ele_top >= nav_height - nav_half_height){
            ///  元素的高度大于总高度减去客户端一半高度，滚到最大
            let scroll_height = nav_height - client_height;
            nav.scrollTo(0, scroll_height);
        }else{
            // 滚
            let scroll_height = ele_top - nav_half_height;
            nav.scrollTo(0, scroll_height);
        }
    },
    proxyVideoAttribute(video){
        /// 代理video的属性
        Object.defineProperty(video, "playbackRate", {
            get: function(){
                return jb_domain.user_config.rate;
            },
            
            set: function(newValue){
                if(typeof(newValue) === "number"){
                    if(newValue < 0.5 || newValue > 16){
                        console.error("输入不合法, 不能小于0.5 大于16");
                    }else{
                        // 我自己的判断
                        if(newValue > 8){
                            console.warn("不允许设置大于8倍速");
                        }else{
                            playbackRate = newValue;
                            jb_domain.user_config.rate = newValue;
                        }
                    }
                }else{
                    console.error("输入不合法: 速率必须设置为数字");
                }
            }
        });
    },
    getIsPlay(){
        let is_play = $(this.system_config.play_btn).css("display") === "none";  // 判断按钮是否隐藏了
        this.system_config.isPlay = is_play;
    },
    stopJb(){
        this.clearTimeouts();

        if(jb_domain.system_config.m_video !== null){
            this.m_pause(); /// 暂停视频
            this.remove_m_video_event();
        }
        this.resetParam();
    },
    clearTimeouts(){
        Object.keys(this.system_config.timeouts).forEach(function(v){
            if(jb_domain.system_config.timeouts[v]){
                clearTimeout(jb_domain.system_config.timeouts[v]);
            }
        });
    },
    init(){
        let tags_list = document.querySelectorAll(".tabtags")[0];
        let spans = tags_list.querySelectorAll("span");
        for(let i = 0;i < spans.length;i++){
            if(spans[i].title.search("视频") !== -1){
                if(i === 0){
                    break;
                }else{
                    this.system_config.timeouts.timeout_12 = setTimeout(() => {
                        spans[i].click();
                    }, 1649);
                    break;
                }
            }
        }
        this.resetParam();
    },
    resetParam(){
        //  重置参数
        this.system_config.current_video_index = 0;
        this.system_config.m_video = null;
        this.system_config.isPaused = false;
        this.user_config.is_auto_answer = true;
        this.system_config.is_monual_select = false;
        this.system_config.current_page_video_list = [];
        this.system_config.current_page_video_states = [];
        this.system_config.iframe_1_docu = null;
        this.system_config.iframe_2_docu = null;
        this.system_config.iframe_1_window = null;
        this.system_config.iframe_2_window = null;
        this.system_config.m_video_obj = [];
        this.system_config.isClickNavInit = false;
        let objs = Object.keys(this.system_config.timeouts);
        objs.forEach(function(v){
            jb_domain.system_config.timeouts[v] = null;  // 清空计时器
        });
        this.system_config.submit_btn = null;
    },
    init_ele_1(){
        let iframe_1 = document.getElementById("iframe");
        this.system_config.iframe_1_docu = iframe_1.contentDocument;
        this.system_config.iframe_1_window = iframe_1.contentWindow;
        this.agentIframeAlert(this.system_config.iframe_1_window, 1);
    },
    init_ele_2(){
        let iframe_2 = this.system_config.iframe_1_docu.getElementsByTagName("iframe");
        let iframe_len = iframe_2.length;
        let len = 0, docu,v_obj;
        for(let i = 0;i<iframe_len;i++){
            docu = iframe_2[i].contentDocument;
            v_obj = docu.querySelector("video");
            
            if(v_obj !== null){
                this.system_config.m_video_obj.push(v_obj);
                this.system_config.current_page_video_list.push(iframe_2[i]);  // 含有视频的iframe
                len++;
            }
        }
        if(len === 0){
            ///  当前页没有视频,下一节
            this.appendChildToInputDiv("当前页没有视频可播放，正在切换", this.system_config.colors.system_tip);
            this.next_section(false);
        }else{
            this.get_current_page_video_states();
            this.system_config.current_page_video_count = len;
            this.appendChildToInputDiv("当前页有 " + len + "个视频");
            
            this.initVideo();
        }
        this.system_config.lock = false;  // 解锁  
    },
    get_current_page_video_states(){
        let states_div = this.system_config.iframe_1_docu.getElementsByClassName("ans-job-icon");
        let state_value;
        for(let i = 0;i < states_div.length;i++){
            state_value = parseInt(getComputedStyle(states_div[i]).backgroundPositionY);
            state_value = state_value < 0 ? (-state_value) : state_value;
            if(state_value >= 20){
                /// 看了
                this.system_config.current_page_video_states.push(1);
            }else{
                /// 没看
                this.system_config.current_page_video_states.push(0);
            }
        }
    },
    agentIframeAlert(m_window, index){
        ///  代理alert
        m_window.m_alert = m_window.alert;
        m_window.alert = function (str){
            this.parent.alert(str, index);
        }
    },
    initVideo(){
        //  先判断这个看了没
        if(this.user_config.isPlayHasWatchedVideo || this.system_config.current_page_video_states[this.system_config.current_video_index] === 0){
            let iframe_2_docu = this.system_config.current_page_video_list[this.system_config.current_video_index].contentDocument;
            this.system_config.iframe_2_docu = iframe_2_docu;
            let iframe_2_window = this.system_config.current_page_video_list[this.system_config.current_video_index].contentWindow;
            this.system_config.iframe_2_window = iframe_2_window;
            this.agentIframeAlert(iframe_2_window, 2);
            this.system_config.m_video = iframe_2_docu.getElementById("video_html5_api");
            this.system_config.play_btn = iframe_2_docu.querySelectorAll(".vjs-big-play-button")[0];
            this.getIsPlay();
            this.add_m_video_event();
            let volume = this.user_config.m_video_volume > 1 || this.user_config.m_video_volume < 0 || typeof(this.user_config.m_video_volume) !== 'number' ? 0.5 : this.user_config.m_video_volume;
            this.system_config.m_video.volume = volume;
            if(this.user_config.isRate){
                this.system_config.timeouts.timeout_6 = setTimeout(() => {
                    this.ratePlay();
                    // this.setVideoRate();  ///  强制开启倍速
                }, 3421);
            }
            this.appendChildToInputDiv("播放当前页第 " + (this.system_config.current_video_index + 1) + "个视频");
        }else{
            //  看过了
            this.system_config.timeouts.timeout_7 = setTimeout(() => {
                this.switch_v();
            }, 1763);
            this.appendChildToInputDiv("第 " + (this.system_config.current_video_index + 1) + "个视频已经看过了");
        }
    },
    setVideoRate(){
        let rate = this.user_config.rate;
        v_obj.ratechange[0].listener
        if(typeof(rate) === "number"){
            if(rate < 0.5 || rate > 16){
                rate = 1;
                this.appendChildToInputDiv("输入不合法, 不能小于0.5 大于16", this.system_config.colors.system_error);
            }else{
                this.appendChildToInputDiv("已设置" + rate + "倍速", this.system_config.colors.system_tip);
            }
        }else{
            this.appendChildToInputDiv("输入不合法: 速率必须设置为数字", this.system_config.colors.system_error);
        }
    },
    switchVideo(){
        this.system_config.current_video_index++;
        this.initVideo();
        this.system_config.timeouts.timeout_8 = setTimeout(() => {
            this.byClickPlayBtnPlay();
        }, 2165);
    },
    ratePlay(){
        this.system_config.m_video.playbackRate = this.user_config.rate;
        this.system_config.timeouts.timeout_9 = setTimeout(() => {
            if(this.system_config.m_video.playbackRate !== this.user_config.rate){
                this.user_config.isRate = false;
                this.appendChildToInputDiv("本视频不支持倍速播放 !!!", this.system_config.colors.system_error);
            }else{
                this.appendChildToInputDiv('本视频已是'+this.user_config.rate+'倍速播放');
            } 
        }, 2000);
    },
    get_current_section(isSave){
        //  得到当前在第几章节
        isSave = typeof(isSave) === 'boolean' ? isSave : true;
        let sec_list = this.system_config.section_list;
        let i;
        for(i = 0;i<sec_list.length;i++){
            let child_ele = sec_list[i].firstElementChild;
            let b = child_ele.className;
            if(b.search("currents") !== -1){
                if(isSave){
                    if(this.system_config.current_section === i){
                        this.system_config.isClickNav = false;
                    }else{
                        this.system_config.isClickNav = true;
                        this.system_config.current_section = i;
                    }
                }
                break;
            }
        }
        return i;
    },
    getSectionCount(){
        /// 获取章节数量
        let sec_list = this.system_config.section_list;
        let sec_list_str;
        let count = sec_list.length;
        let cells_len = this.system_config.cells.length;
        for(let i = cells_len - 1;i >= 0;i--){
            sec_list_str = this.system_config.cells[i].querySelector(".titlewords").innerText;
            count -= this.system_config.cells[i].querySelectorAll(".ncells").length;
            if(sec_list_str.search('阅读') !== -1){
                break;
            }
        }
        if(count >= 1){
            this.system_config.section_count = count;
        }else{
            this.system_config.section_count = sec_list.length;
        }
    },
    pause_video(e){
        let m_that = jb_domain.system_config.that;
        let is_play_complete = parseInt(this.duration) !== parseInt(this.currentTime);
        let is_paused = !m_that.system_config.isPaused; //  是否是手动暂停，是为true

        if(is_play_complete){
            ///  没播放完执行
            m_that.isAnswer(m_that); // 判断是不是要答题了
            if(m_that.system_config.is_answer){
                ///  答题
                m_that.system_config.problem = m_that.system_config.iframe_2_docu.querySelectorAll("#ext-comp-1040-innerCt")[0];
                m_that.getProblem();
                m_that.autoAnswer();
                m_that.appendChildToInputDiv("答题");
            }else{
                if(is_paused){
                    m_that.appendChildToInputDiv("意外暂停");
                    m_that.system_config.timeouts.timeout_10 = setTimeout(() => {
                        if(!m_that.system_config.isHasCheck){
                            this.play();
                        }
                    },1725);
                }else{
                    m_that.appendChildToInputDiv("手动暂停");
                }
            }

        }else{
            /// 播放完换章节
            m_that.system_config.timeouts.timeout_5 = setTimeout(() => {
                m_that.switch_v();
            }, 3982);
        }
    },
    switch_v(){
        if(this.system_config.current_video_index + 1 >= this.system_config.current_page_video_count){
            //  这个页面视频已经放完了
            this.switchSection();
        }else{
            //  没放完
            this.switchVideo(); // 切换视频
        }
    },
    hijackAlert(){
        //  如果学习通有alert弹出，则停止脚本
        //父页面的代理
        window.alert = function(str){
            if(jb_domain.system_config.is_chaoxing){
                ///  是学习通弹出的就不展示了吧
                jb_domain.system_config.isHasCheck = true;
                jb_domain.appendChildToInputDiv("提示： 已经被系统检测到，已停止脚本执行", jb_domain.system_config.colors.system_error);
                jb_domain.stopJb();
                jb_domain.appendChildToInputDiv("学习通提醒您: " + str, jb_domain.system_config.colors.system_error);
            }else{
                window.system_alert(str);
            }

        }
    },
    switchSection(){
        ///  判断所有的课程是否已经完了
        if(this.system_config.current_section + 1 > this.system_config.section_count){
            ///  已经全部播放完了
            
        }else{

            this.next_section();
            this.appendChildToInputDiv("切换章节");
        }
    },
    isAnswer(m_this){
        let problem_ele = jb_domain.system_config.iframe_2_docu.querySelectorAll("#ext-comp-1040")[0];
        let problem = problem_ele.querySelectorAll("#ext-comp-1040-innerCt")[0];; // 判断这个标签是不是空
        if(problem.innerHTML.trim() !== ""){
            m_this.system_config.is_answer = true;
        }else{
            m_this.system_config.is_answer = false;
        }
    },
    *play_video(){
        this.appendChildToInputDiv("准备播放第" + (this.system_config.current_section + 1) + "个视频");
        this.appendChildToInputDiv("第一页初始化完毕");
        yield this.init_ele_1();
        this.appendChildToInputDiv("第二页初始化完毕");
        yield this.init_ele_2();
        this.appendChildToInputDiv("开始播放");
        yield this.byClickPlayBtnPlay();
    },
    byClickPlayBtnPlay(){
        if(!this.system_config.isPlay){
            this.system_config.play_btn.click();
        }else{
            ///  第一次播放的按钮已经没了
            if(this.system_config.m_video.paused){
                this.system_config.m_video.play();
            }else{
                this.appendChildToInputDiv("已经开始播放了");
            }
        }

    },
    jb(){
        this.init();
        if(this.system_config.current_section + 1 > this.system_config.section_count){
            this.appendChildToInputDiv(this.system_config.completed_str, this.system_config.colors.system_tip);
            return;
        }
        let m_play_video = this.play_video();
        this.system_config.timeouts.timeout_1 = setTimeout(() => {m_play_video.next();}, 2000);
        this.system_config.timeouts.timeout_2 = setTimeout(() => {m_play_video.next();}, 5000);
       
        this.system_config.timeouts.timeout_3 = setTimeout(() => {
            if(this.system_config.m_video !== null){
                m_play_video.next();
            }
        }, 7000);
        
    },
    add_m_video_event(){
        if(this.system_config.m_video !== null)
            this.system_config.m_video.addEventListener("pause", this.pause_video);
    },
    remove_m_video_event(){
        if(this.system_config.m_video !== null)
            this.system_config.m_video.removeEventListener("pause", this.pause_video, false);
    },
    m_pause(){
        ///  暂停视频
        this.system_config.isPaused = true;
        this.system_config.m_video.pause();
    },
    m_play(){
        this.system_config.isPaused = false;
        this.system_config.m_video.play();
    },
    next_section(isHasVideo = true){
        //  判断还有没有下一节
        let j = ++this.system_config.current_section;
        if(j + 1 > this.system_config.section_count){
            ///  完了
            this.appendChildToInputDiv(this.system_config.completed_str, this.system_config.colors.system_tip);
        }else{
            let m_a = this.system_config.section_list[j].querySelector("a");
            m_a.click();
            if(isHasVideo){
                this.remove_m_video_event(); //  移除上个视频的video监测
            }
            this.system_config.timeouts.timeout_4 = setTimeout(() => {
                this.jb();
            }, 3000);
        }
    },
    autoAnswer(){
        /// 自动填写视频中的题目
        //  取消video监测
        this.remove_m_video_event();
        ///  判断是不是单选和判断
        if(this.system_config.problem_type === 0 || this.system_config.problem_type === 1){
            if(this.user_config.is_auto_answer){
                this.appendChildToInputDiv("给你 3 秒选择时间", this.system_config.colors.system_tip);
                setTimeout(() => {
                    this.isHasSelect();  //  判断是不是要手动答题
                    if(this.system_config.is_monual_select){
                        setTimeout(() => {
                            //  2秒多后尝试提交答案
                            this.submit_test();
                        }, 2341);
                    }else{
                        this.fillAnswer();
                    }
                },3000);  /// 给3秒的手动选择时间
            }else{
                this.appendChildToInputDiv("请手动选择选项", this.system_config.colors.system_tip);
            }
        }else{
            this.user_config.is_auto_answer = false;
            this.appendChildToInputDiv("暂时不会自动答除了判断和单选以外的题型，请手动选择提交", this.system_config.colors.system_warning);
        }
        
    },
    fillAnswer(){
        setTimeout(() => {
            if(this.system_config.already_select_index >= this.system_config.options.length){
                this.appendChildToInputDiv("出问题了，请检查", this.system_config.colors.system_error);
                return;
            }else{
                this.appendChildToInputDiv("填充答案");
                this.selectAnswer();
            }
        }, 1875);
    },
    isHasSelect(){
        //  如果用户已经选择了，则当前章节所有答题是手动
        let options = this.system_config.options;
        for(let i = 0;i < options.length;i++){
            if(options[i].querySelector("input").checked){
                // 用户已经选了
                this.system_config.is_monual_select = true;
                this.user_config.is_auto_answer = false;
                break;
            }
        }
    },
    selectAnswer(){
        this.system_config.options[this.system_config.already_select_index].querySelector("input").click();
        setTimeout(() => {
            //  2秒多后尝试提交答案
            this.submit_test();
        }, 2341);
    },
    getProblem(){
        let problem = this.system_config.problem;
        //  0  判断  1  选择   2,3 其他
        /// 得到题目类型
        let type_arr = ['判断题', '选择题', '其他类型'];
        let problem_type_str = problem.querySelectorAll(".tkTopic_title")[0].innerText;
        let type = -1;
        if(problem_type_str.search("判断题") !== -1){
            type = 0;
        }else if(problem_type_str.search("选择题") !== -1 || problem_type_str.search("单选题") !== -1){
            type = 1;
        }else{
            type = 2;
        }
        this.system_config.problem_type = type;
        this.appendChildToInputDiv("题型: " + type_arr[type]);
    
        // 得到题目
        let problem_title = problem.querySelectorAll(".tkItem_title")[0];
        let problem_title_str = problem_title.innerText;
        this.appendChildToInputDiv("问题: " + problem_title_str);
        
        ///  获得选项
        let options = problem.querySelectorAll("label");
        if(options.length >= 1){
            this.system_config.problem_type = options[0].querySelector("input").type === "radio" ? type : 3;  // 多选题赋值3
        }else{
            this.appendChildToInputDiv("没有获取到选项");
        }

        this.system_config.options = options;
        this.system_config.submit_btn = this.system_config.iframe_2_docu.querySelector("#videoquiz-submit");
        this.system_config.submit_btn.addEventListener("click", function(){
            if(!jb_domain.user_config.is_auto_answer){
                setTimeout(() => {
                    jb_domain.isRight();
                    if(jb_domain.system_config.is_right){
                        jb_domain.selectRight();
                        jb_domain.appendChildToInputDiv("选择正确", jb_domain.system_config.colors.system_tip);
                    }else{
                        jb_domain.appendChildToInputDiv("选择错误，请重新选择", jb_domain.system_config.colors.system_warning);
                    }
                },1587);
            }
            
        });
        this.appendChildToInputDiv("有" + options.length+ "个选项");
    },

    isRight(){
        let problem_ele = jb_domain.system_config.iframe_2_docu.querySelectorAll("#ext-comp-1040")[0];
        let problem = problem_ele.querySelectorAll("#ext-comp-1040-innerCt")[0];; // 判断这个标签是不是空
        if(problem.innerHTML.trim() === ""){
            this.system_config.is_right = true;
        }else{
            this.system_config.is_right = false;
        }
    },

    submit_test(){
        /// 提交视频的测验
        this.system_config.submit_btn.click();
        setTimeout(() => {
            this.isRight();  //  判断是否选择正确
            if(this.system_config.is_right){
                //  回答正确
                this.selectRight();
            }else{
                // 回答错了
                if(this.user_config.is_auto_answer){
                    this.fillAnswer();
                    this.system_config.already_select_index++;
                    this.appendChildToInputDiv("正尝试重新选择选项", this.system_config.colors.system_warning);
                }else{
                    this.appendChildToInputDiv("请重新选择选项,并点击执行按钮进行提交", this.system_config.colors.system_error);
                }
            }
            ///  恢复没点击状态
            this.system_config.is_click = false;
        }, 1324);
    },
    selectRight(){
        //  添加video监测
        this.system_config.m_video.addEventListener("pause", this.pause_video);
        this.appendChildToInputDiv("选择正确");
        this.system_config.already_select_index = 0;
        this.system_config.is_answer = false;
    },
    getAllLink(){
        let arr = [];
        let all_a = document.getElementsByTagName("a");
        let reg_str = "getTeacherAjax";
        let js_str = "javascript";
        for(let i = 0;i<all_a.length;i++){
            let str = all_a[i].href;
            if(str.search(reg_str) !== -1){
                let lam_str = str.slice(js_str.length + 1, str.length);
                arr.push(lam_str);
            }
        }
        this.system_config.a_list = arr;
    },
    appendChildToInputDiv(str, color){
        color = color !== undefined ? color : this.system_config.colors.system_default;
        let div = document.createElement("div");
        div.style.color = color;
        div.style.margin = "8px 0";
        div.innerHTML = str;
        this.system_config.show_div.appendChild(div);
        //  使滚动一直在最底下
        let box_height = window.parseInt(this.system_config.show_div.style.height);
        let box_docu_height = this.system_config.show_div.scrollHeight;
        if(box_docu_height > box_height){
            //  滚动
            this.system_config.show_div.scrollTo(0, box_docu_height - box_height);
        }
    },
    isSuccessClickNav(index){
        let main = document.getElementsByClassName('main')[0];
        if(main){
            let span_text = main.querySelector('h1').innerText.trim();
            let text = this.system_config.section_list[index].innerText;
            if(text.search(span_text) !== -1){
                return true;
            }else{
                return false;
            }
        }else{
            return null;
        }

    },
    actionCommand(form_str){
        jb_domain.system_config.lock = true;  //  加锁，防止用户输入多次 1
        if(jb_domain.system_config.is_chaoxing && form_str === "1"){
            jb_domain.appendChildToInputDiv("正在初始化", jb_domain.system_config.colors.system_tip);
            if(!jb_domain.system_config.isClickNavInit)
                jb_domain.get_current_section();
            if(jb_domain.system_config.isClickNav){
                let m_a = jb_domain.system_config.section_list[jb_domain.system_config.current_section].querySelector("a");
                m_a.click();
            }else{
            }

            jb_domain.system_config.timeouts.timeout_11 = setTimeout(() => {
                jb_domain.jb();
            },1365);
            return;
        }
        try{
            let res = eval(form_str);
            jb_domain.appendChildToInputDiv(res, jb_domain.system_config.colors.system_log);
        }catch(e){
            jb_domain.appendChildToInputDiv(e,jb_domain.system_config.colors.system_error);
        }
    },
    createBox(){
        let div = document.createElement("div");
        div.style.width = "580px";
        div.style.height = "200px";
        div.style.position = "fixed";
        div.style.bottom = "10px";
        div.style.left = "20px";
        div.style.backgroundColor = "rgba(0,0,0,.7)";
        div.style.padding = "16px";
        div.style.boxSizing = "border-box";
        this.system_config.show_div_box = div;
        let show_div = document.createElement("div");
        show_div.style.width = "100%";
        show_div.style.height = "124px";
        show_div.id = "show_div";
        show_div.style.color = "#fff";
        show_div.style.overflow = "auto";
        div.appendChild(show_div);
        this.system_config.show_div = show_div;
        show_div.ondblclick = function(){
            this.innerHTML = "";
            setTimeout(function(){
            }, 1000);
        }
        
        let btn = document.createElement("input");
        btn.value = "执行";
        btn.style.position = "absolute";
        btn.style.right = "14px";
        btn.style.bottom = "20px";
        btn.style.width = "100px";
        btn.style.textAlign = "center";
        btn.style.height = "30px";
        btn.onclick = function(){
            
            let str = jb_domain.system_config.command_box.value;
            jb_domain.system_config.command_box.value = "";
            let form_str = str.trim();
            if(form_str !== ""){
                jb_domain.actionCommand(form_str);
            }else if(jb_domain.system_config.is_answer){
                // 提交答案
                if(!jb_domain.system_config.is_click){
                    jb_domain.system_config.is_click = true;
                    jb_domain.submit_test();
                }
            }else{
                jb_domain.appendChildToInputDiv("命令框是空的嘞");
            }
        }
        div.appendChild(btn);

        let command_input_box = document.createElement("input");
        command_input_box.style.position = "absolute";
        command_input_box.style.width = "410px";
        command_input_box.style.height = "30px";
        command_input_box.style.padding = "8px 18px";
        command_input_box.style.left = "24px";
        command_input_box.style.bottom = "20px";
        command_input_box.backgroundColor = "#fff";
        command_input_box.style.boxSizing = "border-box";
        command_input_box.addEventListener("keydown", function(e){
            if(e.code === 'Enter'){
                // 按了回车
                let value = this.value.trim();
                if(value !== ""){
                    if(!jb_domain.system_config.lock){
                        jb_domain.actionCommand(value);
                    }
                    this.value = "";
                }
            }
        });
        this.system_config.command_box = command_input_box;
        div.appendChild(command_input_box);
        
        document.body.appendChild(div);
    }
}

jb_domain.init_base();

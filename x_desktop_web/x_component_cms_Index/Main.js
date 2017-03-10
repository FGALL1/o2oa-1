MWF.xApplication.cms = MWF.xApplication.cms || {};
MWF.CMSE = MWF.xApplication.cms.Index = MWF.xApplication.cms.Index ||{};
MWF.require("MWF.widget.Identity", null,false);
MWF.xDesktop.requireApp("cms.Index", "Actions.RestActions", null, false);
MWF.xApplication.cms.Index.options = {
	multitask: false,
	executable: true
}
MWF.xApplication.cms.Index.Main = new Class({
	Extends: MWF.xApplication.Common.Main,
	Implements: [Options, Events],

	options: {
		"style": "default",
		"name": "cms.Index",
		"icon": "icon.png",
		"width": "1160",
		"height": "700",
		"isResize": false,
		"isMax": true,
		"title": MWF.CMSE.LP.title
	},
	onQueryLoad: function(){
		this.lp = MWF.xApplication.cms.Index.LP;
	},
	loadApplication: function(callback){
		this.columns = [];
		this.restActions = new MWF.xApplication.cms.Index.Actions.RestActions();
		this.createNode();
		this.loadApplicationContent();
	},
	reload : function(){
		this.contentContainerNode.destroy();
		this.loadContent();
	},
	createNode: function(){
		this.content.setStyle("overflow", "hidden");
		this.node = new Element("div", {
			"styles": {"width": "100%", "height": "100%", "overflow": "hidden"}
		}).inject(this.content);
	},
	loadApplicationContent: function(){
		this.loadTitle();
		this.loadContent();
	},
	loadTitle : function(){
		this.loadTitleBar();
		this.loadCreateDocumentActionNode();
		this.loadTitleTextNode();
		this.loadRefreshNode();
		this.loadSearchNode();
	},
	loadTitleBar: function(){
		this.titleBar = new Element("div", {
			"styles": this.css.titleBar
		}).inject(this.node);
	},
	loadCreateDocumentActionNode: function() {
		this.createDocumentAction = new Element("div", {
			"styles": this.css.createDocumentAction
		}).inject(this.titleBar);
		this.createDocumentAction.addEvents({
			"click": function(e){
				if( this.creater ){
					this.creater.load();
				}else{
					MWF.xDesktop.requireApp("cms.Index", "Creater", function(){
						this.creater = new MWF.xApplication.cms.Index.Creater(this,null,this);
						this.creater.load();
					}.bind(this));
				}
			}.bind(this)
		});
	},
	loadTitleTextNode: function(){
		this.titleTextNode = new Element("div", {
			"styles": this.css.titleTextNode,
			"text": this.lp.title
		}).inject(this.titleBar);
	},
	loadSearchNode: function(){
		this.searchBarAreaNode = new Element("div", {
			"styles": this.css.searchBarAreaNode
		}).inject(this.titleBar);

		this.searchBarNode = new Element("div", {
			"styles": this.css.searchBarNode
		}).inject(this.searchBarAreaNode);

		this.searchBarActionNode = new Element("div", {
			"styles": this.css.searchBarActionNode
		}).inject(this.searchBarNode);
		this.searchBarResetActionNode = new Element("div", {
			"styles": this.css.searchBarResetActionNode
		}).inject(this.searchBarNode);
		this.searchBarResetActionNode.setStyle("display","none");

		this.searchBarInputBoxNode = new Element("div", {
			"styles": this.css.searchBarInputBoxNode
		}).inject(this.searchBarNode);
		this.searchBarInputNode = new Element("input", {
			"type": "text",
			"value": this.lp.searchKey,
			"styles": this.css.searchBarInputNode
		}).inject(this.searchBarInputBoxNode);

		var _self = this;
		this.searchBarActionNode.addEvent("click", function(){
			this.search();
		}.bind(this));
		this.searchBarResetActionNode.addEvent("click", function(){
			this.reset();
		}.bind(this));
		this.searchBarInputNode.addEvents({
			"focus": function(){
				if (this.value==_self.lp.searchKey) this.set("value", "");
			},
			"blur": function(){if (!this.value) this.set("value", _self.lp.searchKey);},
			"keydown": function(e){
				if (e.code==13){
					this.search();
					e.preventDefault();
				}
			}.bind(this),
			"selectstart": function(e){
				e.preventDefault();
			}
		});
	},
	loadRefreshNode : function(){
		this.refreshAreaNode = new Element("div", {
			"styles": this.css.refreshAreaNode
		}).inject(this.titleBar);

		this.refreshActionNode = new Element("div", {
			"styles": this.css.refreshActionNode,
			"title" : this.lp.refresh
		}).inject(this.refreshAreaNode);
		this.refreshActionNode.addEvent("click", function(){
			this.reload();
		}.bind(this));
	},
	loadContent: function(callback){
		this.contentContainerNode = new Element("div",{
			"styles" : this.css.contentContainerNode
		}).inject(this.node);
		this.contentNode = new Element("div", {
			"styles": this.css.contentNode
		}).inject(this.contentContainerNode);

		this.createColumnNodes();

		MWF.require("MWF.widget.ScrollBar", function(){
			new MWF.widget.ScrollBar(this.contentContainerNode, {
				"indent": false,"style":"xApp_TaskList", "where": "before", "distance": 30, "friction": 4,	"axis": {"x": false, "y": true},
				"onScroll": function(y){
					//var scrollSize = _self.elementContentNode.getScrollSize();
					//var clientSize = _self.elementContentNode.getSize();
					//var scrollHeight = scrollSize.y-clientSize.y;
					//if (y+200>scrollHeight) {
					//	if (!_self.view.isItemsLoaded) _self.view.loadElementList();
					//}
				}
			});
		}.bind(this));

		this.setContentSize();

		this.addEvent("resize", function(){
			this.setContentSize();
		}.bind(this));
	},
	createColumnNodes: function(){
		this.restActions.listColumn(function(json){

			if( typeOf(json.data)!="array" )return;
			var tmpArray = json.data;
			tmpArray.sort(function( a, b ){
				return parseFloat(a.appInfoSeq) - parseFloat(b.appInfoSeq)
			})
			json.data = tmpArray;

			var i = 0;
			json.data.each(function(column){
				var column = new MWF.xApplication.cms.Index.Column(this, column, {"index" : i++ });
				column.load();
				this.columns.push(column);
			}.bind(this));
		}.bind(this));
	},
	search : function( key ){
		if(!key)key = this.searchBarInputNode.get("value");
		if(key==this.lp.searchKey)key="";
		if( key!="" ){
			this.searchBarResetActionNode.setStyle("display","block");
			this.searchBarActionNode.setStyle("display","none");
		}
		this.columns.each(function( column ){
			column.search( key );
		}.bind(this))
	},
	reset : function(){
		this.searchBarInputNode.set("value",this.lp.searchKey);
		this.searchBarResetActionNode.setStyle("display","none");
		this.searchBarActionNode.setStyle("display","block");
		this.columns.each(function( column ){
			column.loadList();
		}.bind(this))
	},

	clearContent: function(){
		//if (this.indexContent){
		//	if (this.index) delete this.index;
		//	this.indexContent.destroy();
		//	this.indexContent = null;
		//}
	},
	openManager : function(){
		var appId = "cms.Column";
		if (this.desktop.apps[appId]){
			this.desktop.apps[appId].setCurrent();
		}else {
			this.desktop.openApplication(null, "cms.Column", {
				"appId": appId,
				"onQueryLoad": function(){
				}
			});
		}
	},
	recordStatus: function(){
		//if (this.menu.currentNavi){
		//	var naviType = this.menu.currentNavi.retrieve("type");
		//	var naviData = this.menu.currentNavi.retrieve("naviData");
		//	return {
		//		"navi" :{ "type": naviType, "id": naviData.id, "columnId":naviData.appId},
		//		"view" : this.index.currentViewData.id ? this.index.currentViewData.id : "default"
		//	};
		//}
	},
	setContentSize: function(){
		var titlebarSize = this.titleBar ? this.titleBar.getSize() : {"x":0,"y":0};
		var nodeSize = this.node.getSize();
		var pt = this.contentContainerNode.getStyle("padding-top").toFloat();
		var pb = this.contentContainerNode.getStyle("padding-bottom").toFloat();

		var height = nodeSize.y-pt-pb-titlebarSize.y;
		this.contentContainerNode.setStyle("height", ""+height+"px");
	}
});

MWF.xApplication.cms.Index.Column = new Class({
	Implements: [Options, Events],
	options: {
		"where": "bottom",
		"index" : 0
	},

	initialize: function (app, data, options) {
		this.setOptions(options);
		this.app = app;
		this.container = this.app.contentNode;
		this.data = data;
		this.isNew = false;
		this.backgroundColors = ["#cde6fe","#e6f3ff","#f5f6f7","#fcfcfc"];
		this.defaultColumnIcon = "/x_component_cms_Index/$Main/"+this.app.options.style+"/icon/column.png";
	},
	load : function(){
		this.loadNode();
		this.loadTop();
		this.loadCategory();
		this.loadList();
	},
	loadNode : function(){
		this.node = new Element("div.columnItem", {
			"styles": this.app.css.columnItemNode
		}).inject(this.container,this.options.where);

		var topNode = this.topNode = new Element("div.columnItemTopNode", {
			"styles": this.app.css.columnItemTopNode
		}).inject(this.node);
		var mod = this.options.index % this.backgroundColors.length;
		this.color = this.backgroundColors[mod];
		topNode.setStyle("background-color",this.color);

		this.categoryContainer = new Element("div.categoryContainer",{
			"styles" : this.app.css.categoryContainer
		}).inject(this.node);

		this.categoryList = new Element("div.categoryList",{
			"styles" : this.app.css.categoryList
		}).inject(this.categoryContainer);

		this.documentList = new Element("div",{
			"styles" : this.app.css.documentList
		}).inject(this.node);
	},
	loadTop: function () {
		this.data.name = this.data.appName;
		var columnName = this.data.appName;
		var alias = this.data.appAlias;
		var memo = this.data.description;
		var order = this.data.appInfoSeq;
		var creator =this.data.creatorUid;
		var createTime = this.data.createTime;

		var topNode = this.topNode;


		//var iconNode = this.iconNode = new Element("div",{
		//	"styles" : this.app.css.columnItemIconNode
		//}).inject(topNode);
		//
		//if (this.data.appIcon){
		//	this.iconNode.setStyle("background-image", "url(data:image/png;base64,"+this.data.appIcon+")");
		//}else{
		//	this.iconNode.setStyle("background-image", "url("+this.defaultColumnIcon+")")
		//}

		var iconAreaNode = this.iconAreaNode = new Element("div",{
			"styles" : this.app.css.columnItemIconAreaNode
		}).inject(topNode);

		var iconNode = this.iconNode = new Element("img",{
			"styles" : this.app.css.columnItemIconNode
		}).inject(iconAreaNode);
		if (this.data.appIcon){
			this.iconNode.set("src", "data:image/png;base64,"+this.data.appIcon+"");
		}else{
			this.iconNode.set("src", this.defaultColumnIcon)
		}
		iconNode.makeLnk({
			"par": this._getLnkPar()
		});

		var textNode = new Element("div",{
			"styles" : this.app.css.columnItemTextNode
		}).inject(topNode)

		var titleNode = new Element("div",{
			"styles" : this.app.css.columnItemTitleNode,
			"text" : columnName,
			"title": (alias) ? columnName+" ("+alias+") " : columnName
		}).inject(textNode)

		var description = ( memo && memo!="") ? memo : this.app.lp.noDescription;
		var descriptionNode = new Element("div",{
			"styles" : this.app.css.columnItemDescriptionNode,
			"text" : description,
			"title" : description
		}).inject(textNode)

		var _self = this;
		topNode.addEvents({
			//"mouseover": function(){if (!_self.selected) this.setStyles(_self.app.css.columnItemNode_over);},
			//"mouseout": function(){if (!_self.selected) this.setStyles(_self.app.css.columnItemNode);},
			"click": function(e){_self.clickColumnNode(_self,this,e)}
		});
	},
	_getLnkPar: function(){
		var lnkIcon = this.defaultColumnIcon;
		if (this.data.appIcon) lnkIcon = "data:image/png;base64,"+this.data.appIcon;

		var appId = "cms.Module"+this.data.id;
		return {
			"icon": lnkIcon,
			"title": this.data.appName,
			"par": "cms.Module#{\"columnId\": \""+this.data.id+"\", \"appId\": \""+appId+"\"}"
		};
	},
	clickColumnNode : function(_self, el, e ){
		this.openModule("all",e);
	},
	clickMoreLink : function(e){
		var key = this.app.searchBarInputNode.get("value");
		if(key==this.app.lp.searchKey)key="";
		this.openModule("all",e, key);
	},
	openModule : function( categoryId , e , searchKey, isCategory ){
		var appId = "cms.Module"+this.data.id;
		if (this.app.desktop.apps[appId]){
			if( searchKey ){
				this.app.desktop.apps[appId].close();
			}else{
				this.app.desktop.apps[appId].setCurrent();
				return;
			}
		}
		this.app.desktop.openApplication(e, "cms.Module", {
			"columnData": this.data,
			"appId": appId,
			"categoryId": categoryId,
			//"viewId" : "default",
			"isCategory" : isCategory || false,
			"searchKey" : searchKey
		});
	},
	loadCategory : function(){
		var _self = this;
		if( typeOf(this.data.wrapOutCategoryList) != "array" )return;
		var tmpArray = this.data.wrapOutCategoryList;
		tmpArray.sort(function( a, b ){
			return parseFloat(a.categorySeq) - parseFloat(b.categorySeq)
		});
		this.data.wrapOutCategoryList = tmpArray;
		this.data.wrapOutCategoryList.each(function(category){
			var categoryNode = new Element("div.categoryItem",{
				"text" : category.categoryName,
				"styles" : this.app.css.categoryItem
			}).inject( this.categoryList );

			categoryNode.store("category",category)
			categoryNode.addEvents({
				"mouseover" : function(){this.setStyles(_self.app.css.categoryItem_over)},
				"mouseout" : function(){this.setStyles(_self.app.css.categoryItem)},
				"click" : function(e){
					_self.openModule( this.retrieve("category").id , e , "", true)
				}
			})
		}.bind(this));
		if( this.categoryList.getScrollSize().y > this.categoryContainer.getSize().y ){
			this.categoryArrowNode = new Element("div.categoryArrowNode",{
				"styles" : this.app.css.categoryArrowNode
			}).inject( this.categoryContainer );
			this.categoryArrowNode.addEvents({
				"mouseover" : function(){
					this.categoryArrowNode.setStyles( this.categoryArrow != "down" ? this.app.css.categoryArrowNode_over : this.app.css.categoryArrowNode_down_over);
				}.bind(this),
				"mouseout" : function(){
					this.categoryArrowNode.setStyles( this.categoryArrow != "down" ? this.app.css.categoryArrowNode : this.app.css.categoryArrowNode_down);
				}.bind(this),
				"click" : function( e ){
					if( this.categoryArrow != "down" ){
						this.openCategoryList( e );
					}else{
						this.closeCategoryList( e )
					}
				}.bind(this)
			});
		}
	},
	openCategoryList : function( e ){
		this.categoryArrow = "down";
		this.categoryArrowNode.setStyles(this.app.css.categoryArrowNode_down_over );
		this.categoryList.setStyles(this.app.css.categoryList_all);
		window.closeCategoryList = this.closeCategoryList.bind(this);
		this.app.content.addEvent("click", window.closeCategoryList )
		e.stopPropagation();
	},
	closeCategoryList : function( e ){
		this.categoryArrow = "up";
		this.categoryArrowNode.setStyles(this.app.css.categoryArrowNode );
		this.categoryList.setStyles(this.app.css.categoryList);
		this.app.content.removeEvent("click" , window.closeCategoryList )
		e.stopPropagation();
	},
	destroy: function(){
		this.node.destroy();
		MWF.release(this);
		delete this;
	},
	search : function(key){
		if( !key || key==""){
			this.loadList();
			return;
		}
		if(this.documentList)this.documentList.empty();
		if(this.moreArea)this.moreArea.destroy();
		var filter = {
			"titleList": [key],
			"appIdList": [this.data.id],
			"statusList": ["published"]
		};
		this.getDocumentData(function(json){
			//json.count //栏目下文档总数
			//json.size //当前条数
			if( json.count > json.size ){
				this.loadMoreItem( json.count, json.size )
			}
			json.data.each(function(data){
				this.listDocument(data);
			}.bind(this))
		}.bind(this), null, filter );
	},
	loadList: function(){
		if(this.documentList)this.documentList.empty();
		if(this.moreArea)this.moreArea.destroy();
		this.getDocumentData(function(json){
			//json.count //栏目下文档总数
			//json.size //当前条数
			if( json.count > json.size ){
				this.loadMoreItem( json.count, json.size )
			}
			json.data.each(function(data){
				this.listDocument(data);
			}.bind(this))
		}.bind(this));
	},
	listDocument:function(data){
		var _self = this;
		var documentItem = new Element("div",{
			"text" : data.title,
			"styles" : this.app.css.documentItem
		}).inject(this.documentList);
		documentItem.store("documentId",data.id);
		documentItem.addEvents({
			"mouseover" : function(){this.setStyles(_self.app.css.documentItem_over)},
			"mouseout" : function(){this.setStyles(_self.app.css.documentItem)},
			"click" : function(){
				var documentId = this.retrieve("documentId");
				var appId = "cms.Document"+documentId;
				if (_self.app.desktop.apps[appId]){
					_self.app.desktop.apps[appId].setCurrent();
				}else {
					var options = {
						"documentId": documentId,
						"appId": appId,
						"readonly": true
					};
					_self.app.desktop.openApplication(null, "cms.Document", options);
				}
			}
		})
	},
	getDocumentData: function(callback, count, filter){
		if(!count)count=7;
		var id = "(0)";
		if(!filter){
			filter = {
				"appIdList": [this.data.id],
				"statusList": ["published"]
			}
		}
		this.app.restActions.listDocumentFilterNext(id, count, filter, function(json){
			if (callback) callback(json);
		});
	},
	loadMoreItem: function(total, size){
		var _self = this;
		this.moreArea = new Element("div",{
			"styles" : this.app.css.moreArea
		}).inject(this.node);
		this.moreLink = new Element("div",{
			"styles" : this.app.css.moreLink,
			"text" : "查看其余"+(total-size)+"份信息"
		}).inject(this.moreArea);
		this.moreLink.addEvents({
			"mouseover" : function(){this.setStyles(_self.app.css.moreLink_over)},
			"mouseout" : function(){this.setStyles(_self.app.css.moreLink)},
			"click" : function(e){_self.clickMoreLink( e )}
		})
		this.moreArea.setStyle("background-color",this.color)
	}


})
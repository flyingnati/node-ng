Parse.initialize("NwesCh1AeZV7DOWr0hI6vKPEgHCKNX6AqJmTH0C7", "sCMT6JeN8SHH5yYott0jMDgE3lXaHhZ7zDu8aLGS");
var m = new mandrill.Mandrill('Whur6eynhM1ZW2MxaolpKA');

var app = angular.module('app', ['$strap.directives']);

/* directive */


var NAME_REGEXP = /^(([ก-ฮะ-๎]+)|([A-z]+))$/;
app.directive('vlName', function() {
  	return {
	    require: 'ngModel',
	    link: function(scope, elm, attrs, ctrl) {
	      ctrl.$parsers.unshift(function(viewValue) {
	      	console.log(viewValue)
	        if (NAME_REGEXP.test(viewValue)) {
	          // it is valid
	          console.log('valid');
	          ctrl.$setValidity('name', true);
	          return viewValue;
	        } else {
	          // it is invalid, return undefined (no model update)
	          ctrl.$setValidity('name', false);
	          console.log('invalid');
	          return undefined;
	        }
	      });
	    }
    };
});


var PHONE_REGEXP = /^0\d{2}-\d{3}-\d{4}$/;
var PHONE_REGEXP2 = /^\d{10}$/;
app.directive('vlPhone', function() {
  	return {
	    require: 'ngModel',
	    link: function(scope, elm, attrs, ctrl) {
	      ctrl.$parsers.unshift(function(viewValue) {
	      	console.log(viewValue)
	        if (PHONE_REGEXP.test(viewValue)) {
	          	// it is valid
	          	console.log('valid');
	          	ctrl.$setValidity('name', true);
	          	return viewValue;
	        } 
	        else if(PHONE_REGEXP2.test(viewValue)){
	        	// it is valid
	          	console.log('valid');
	          	ctrl.$setValidity('name', true);

	          	var newValue = 	viewValue.substring(0,3) + "-" +
	          					viewValue.substring(3,6) + "-" +
	          					viewValue.substring(6,10);

	          	return newValue;
	        }
	        else {
	          	// it is invalid, return undefined (no model update)
	          	ctrl.$setValidity('name', false);
	          	console.log('invalid');
	          	return undefined;
	        }
	      });
	    }
    };
});


app.controller('ReserveController', ['$scope', function($scope) {
	

	$scope.hideLoginView = true;
	$scope.hideLayoutView = true;

	$scope.hideMainView = true;//true;
	


	$scope.hidePreviewView = false; //false


	$scope.isReserved = "";
	$scope.reservedStatus = "";
	$scope.reservedButton = "";


	$scope.rotating = "rotating";


	$scope.units = [];

	$scope.unitData = {
		unitNo: null,
		land: null,	
		house: null,	
		price: null,	
		reservePayment: null,	
		contactPayment: null,	
		downPercent: null,	
		downAmount: null,	
		phase: null,

		reserved: false,
		name: "",
		sname: "",
		address: "",
		tel: "",
		contactDate: null,
		contactOption: ''
	};

	angular.element(document).ready(function () {
        var currentUser = Parse.User.current();
		if (currentUser) {
			$scope.unitFeed();
		    $scope.$apply(function () {
            	$scope.hideLoginView = true;
            	$scope.hideLayoutView = false;
            		
        	});
		} else {
			$scope.$apply(function () {
		    	$scope.hideLoginView = false;
		    });
		}
    });

	$scope.login = function(){
		console.log($scope.login.user+":"+$scope.login.password);
		Parse.User.logIn($scope.login.user, $scope.login.password, {
			success: function(user) {
				$scope.$apply(function () {
            		$scope.hideLoginView = true;
            		$scope.hideLayoutView = false;
        		});
			},
			error: function(user, error) {
				alert("ไม่สามารถเข้าระบบได้ Username หรือ Password ไม่ถูกต้อง");
			}
		});
	};

	$scope.logout = function(){
        $scope.hideLoginView = false;
        $scope.hideLayoutView = true;	
        Parse.User.logOut();
	};
    
    $scope.keyDown = function(event){
		if (event.which==13)
		{
			if($scope.inputUnitNo >= 1 && $scope.inputUnitNo <= 20)
			{
				$scope.search();
			}else
			{
				alert("ไม่พบยูนิตเลขที่กำหนด กรุณาลองใหม่อีกครั้ง");
				$scope.inputUnitNo = "";
			}
		}
	};

	$scope.go = function(id){
		$scope.inputUnitNo = id;
		$scope.search();
	};

   	$scope.search = function(amount) { 
   		$scope.hideMainView = true;

   		// Connect to Parse.com here
   		var PriceList = Parse.Object.extend("PriceList");
		var query = new Parse.Query(PriceList);
		var unitNo = $scope.inputUnitNo;
		query.equalTo("unitNo", unitNo * 1);
		query.first({
			success: function(object) {
				$scope.$apply(function () {
            		$scope.unitData = object._serverData;
            		console.log($scope.unitData);
            		$scope.hideMainView = false;
            		$scope.hidePreviewView = false;
        		});



        		$scope.unitObject = object;
			},
			error: function(error) {
				$scope.$apply(function () {
            		$scope.hideMainView = true;
        		});
				alert("Error: " + error.code + " " + error.message);
			}
		});	

		

		
	};
	


	$scope.$watch('unitData', function() {
		console.log("watch");
		
		if(typeof $scope.unitData.price != 'undefined'){

			$scope.unitData.pricePerLand 			= $scope.unitData.price / $scope.unitData.land;
			
			$scope.unitData.downPayment 			= $scope.unitData.price * $scope.unitData.downPercent /100;
			$scope.unitData.downPaymentPerMonth 	= $scope.unitData.downPayment / $scope.unitData.downAmount;

			$scope.unitData.bankPayment 			= $scope.unitData.price 
														- $scope.unitData.reservePayment 
														- $scope.unitData.contactPayment 
														- $scope.unitData.downPayment;
			
			$scope.unitData.bankPaymentPerMonth20 	= $scope.Calculate_Payment(
														$scope.unitData.bankPayment,
														7,
														20
													);
			$scope.unitData.bankPaymentPerMonth25 	= $scope.Calculate_Payment(
														$scope.unitData.bankPayment,
														7,
														25
													);
			$scope.unitData.bankPaymentPerMonth30 	= $scope.Calculate_Payment(
														$scope.unitData.bankPayment,
														7,
														30
													);

			if($scope.unitData.reserved)
			{
				$scope.reservedStatus = " ถูกจองแล้ว";
				$scope.isReserved = "reserved";
				$scope.reservedButton = 'แก้ไขข้อมูลการจอง';
			}
			else{
				$scope.reservedStatus = "";
				$scope.isReserved = "";
				$scope.reservedButton = 'จองยูนิตนี้';
			}


			console.log($scope.unitData);
		}

	});


	$scope.Calculate_Payment = function (b,a,c){
		crate=(a/12)/100;
		cperiod=c*12;
		var1=(b*crate);
		var2=1-(1/Math.pow((1+crate),cperiod));
		return var1/var2;
	};

	$scope.print = function() { 
		window.print();
	};
	


	$scope.reserve = function(){
		$scope.hidePreviewView = true;
	};

	$scope.saveReserveData = function(data){

		if (data.$valid)
		{
			
			$scope.unitObject.set("reserved", true);

			$scope.unitObject.set("name", 			$scope.unitData.name);
			$scope.unitObject.set("sname", 			$scope.unitData.sname);
			$scope.unitObject.set("address", 		$scope.unitData.address);
			$scope.unitObject.set("tel", 			$scope.unitData.tel);
			$scope.unitObject.set("contactDate", 	$scope.unitData.contactDate);
			$scope.unitObject.set("contactOption", 	$scope.unitData.contactOption);

			$scope.unitObject.save(null,{
				success: function(){
					$scope.$apply(function () {
						$scope.unitData.reserved = true;
						$scope.reservedStatus = " ถูกจองแล้ว";
						$scope.isReserved = "reserved";
						$scope.reservedButton = 'แก้ไขข้อมูลการจอง';

						$scope.hidePreviewView = false;
					});

					$scope.sendTheMail();
					
				},
				error: function(error){
					alert("Error: " + error.code + " " + error.message);
				}
			});
		}else
		{
			alert("กรุณากรอกข้อมูลให้ถูกต้อง");
		}
	};


	$scope.cancelReserveData = function(){

		var currentUser = Parse.User.current();
		var username = currentUser.get('username');

		Parse.User.logIn(username, $scope.CancelPassword, {
			success: function(user) {
				// Do stuff after successful login.
				$scope.abort();
				$scope.$apply(function () {	
					$scope.CancelPassword = "";
				});
			},
			error: function(user, error) {
				alert("Password ไม่ถูกต้อง");
				
				$scope.$apply(function () {	
					$scope.CancelPassword = "";
				});
			}
		});
	};


	
	$scope.abort = function(){

		var r = confirm("ต้องการยกเลิกการจอง?");
		if(r == true)
		{
			console.log("unitObject");
			console.log($scope.unitObject);

			$scope.unitObject.set("reserved", 		false);
			$scope.unitObject.set("name", 			"");
			$scope.unitObject.set("sname", 			"");
			$scope.unitObject.set("address", 		"");
			$scope.unitObject.set("tel", 			"");
			$scope.unitObject.set("contactDate", 	null);
			$scope.unitObject.set("contactOption", 	"");

			console.log($scope.unitObject);

	    	$scope.unitObject.save(null,{
				success: function(){
					$scope.$apply(function () {
						$scope.unitData.reserved = false;
						$scope.reservedStatus = "";
						$scope.isReserved = "";
						$scope.reservedButton = 'จองยูนิตนี้';

						$scope.hidePreviewView = false;
					});
				},
				error: function(error){
					alert("Error: " + error.code + " " + error.message);
				}
			});
		}
	};



	$scope.unitFeed = function(amount) { 
		$scope.rotating = "rotating";
		$scope.units = [];
   		// Connect to Parse.com here
   		var PriceList = Parse.Object.extend("PriceList");
		var query = new Parse.Query(PriceList);
		var unitNo = $scope.inputUnitNo;
		query.equalTo("phase", 1);
		query.find({
			success: function(results) {
				//alert("Successfully retrieved " + results.length + " scores.");
				// Do something with the returned Parse.Object values
				for (var i = 0; i < results.length; i++) { 
					var object = results[i];
					//console.log(object.id + ' - ' + object.get('unitNo')+ ' - ' + object.get('reserved'));

					$scope.$apply(function () {
						$scope.units.push({
							unitNo: object.get('unitNo'),
							reserved: object.get('reserved'),
							name: object.get('name'),
							tel: object.get('tel')
						});
					});


				}
				$scope.$apply(function () {
					$scope.rotating = "";
				});
				console.log($scope.units);
			},
			error: function(error) {
				$scope.$apply(function () {
            		$scope.hideMainView = true;
        		});
				alert("Error: " + error.code + " " + error.message);
			}
		});		
	};

	$scope.sendTheMail = function() {
		var params = {
		    "message": {
		        "from_email":"nati@flyingcomma.com",
		        "to":[
		        		{"email":"nati@flyingcomma.com"},
		        		{"email":"pek@flyingcomma.com"},
		        		{"email":"sorrawut@flyingcomma.com"}
		        ],
		        "subject": "เพลินไฟลิน Unit เลขที่ "+$scope.unitData.unitNo+" ได้ถูกจองแล้ว",
		        "html": "เพลินไฟลิน Unit เลขที่ "+$scope.unitData.unitNo+' ได้ถูกจองโดยคุณ '+ $scope.unitData.name +
		        		'<br> <img src="http://plernpilin.parseapp.com/img/mark/'+$scope.unitData.unitNo+'.jpg"">'
		    }
		};

	    m.messages.send(params, function(res) {
	        log(res);
	        //alert("Mail Sent");
	    }, function(err) {
	        log(err);
	    });
	}





}]);



function log(obj) {
    $('#response').text(JSON.stringify(obj));
}















Parse.initialize("NwesCh1AeZV7DOWr0hI6vKPEgHCKNX6AqJmTH0C7", "sCMT6JeN8SHH5yYott0jMDgE3lXaHhZ7zDu8aLGS");

var app = angular.module('app', []);

app.controller('ReserveController', ['$scope', function($scope) {
	
	$scope.hideMainView = true;
	$scope.hideCustomerView = true;

	$scope.unitData = {
		unitNo: null,
		land: null,	
		house: null,	
		price: null,	
		reservePayment: null,	
		contactPayment: null,	
		downPercent: null,	
		downAmount: null,	
		phase: null
	};
    
    $scope.keyDown = function(event){
		if (event.which==13)
		{
			if($scope.inputUnitNo >= 1 && $scope.inputUnitNo <=71)
			{
				$scope.search();
			}else
			{
				alert("ไม่พบยูนิตเลขที่กำหนด กรุณาลองใหม่อีกครั้ง");
				$scope.inputUnitNo = "";
			}
		}
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
        		});
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
			console.log($scope.unitData);
		}

	});


	$scope.Calculate_Payment = function (b,a,c){
		crate=(a/12)/100;
		cperiod=c*12;
		var1=(b*crate);
		var2=1-(1/Math.pow((1+crate),cperiod));
		return var1/var2;
	}
	




















}]);
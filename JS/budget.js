
//budget Controller
var budgetController = (function(){

    //Income object
    var IncomeObj = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //Expense object
    var ExpenseObj = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };    

    //storing all in data object
    var data = {
        allItems: {
            inc : [],
            exp : []
        },
        totalItems : {
            inc : 0,
            exp : 0
        },
        budget: 0,
        percentage: -1
    }



    return {
        addItem : function(type,des,value){
            var newItem,id;

            //creating the new Id
            //ex:[1 2 3 4 6 7 8] , inc[6].id = 8 + 1 =9
            if(data.allItems[type].length>0){
                id = data.allItems[type][data.allItems[type].length - 1].id + 1  ;
            }else{
                id = 0;
            }
            

            //adding new item to the specific array by 'type'
            if(type === 'inc'){
                newItem = new IncomeObj(id,des,value);
            }else if(type === 'exp'){
                newItem = new ExpenseObj(id,des,value);
            }

            //pushing the newItem in the specific inc/exp array
            data.allItems[type].push(newItem);
            data.totalItems[type] = data.totalItems[type] + 1;
            
            //return the new object
            return newItem;
        },
        deleteItem : function(type,ID){
            var ids,index;
            //create an array of present item ids
            ids=data.allItems[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(ID);

            //if index is found 
            if(index !== -1){

                data.allItems[type].splice(index,1);

            };



        },

        calBudget : function(type){
            var sum = 0;
            data.allItems[type].forEach(function(curr){
                sum=sum+curr.value;
            });
            data.totalItems[type] = sum;
            data.budget = data.totalItems.inc - data.totalItems.exp ;
            if(data.totalItems.inc > 0){
                data.percentage = Math.round((data.totalItems.exp / data.totalItems.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },
        getBudget : function(){
            return {
                totalInc : data.totalItems.inc,
                totalExp : data.totalItems.exp,
                AvlblBudget : data.budget,
                percentage: data.percentage
            };
        },
        testing : function(){
            return data;
        }
        
        }
    
})();

//UI controller
var UIController = (function(){

    var DOMnames = {
        inputType: '.add_container_choose',
        inputDesc: '.add_container_description',
        inputValue: '.add_container_value',
        inputCheck: '.check_circl',
        incomeContainer: '.income_list',
        expenseContainer: '.expense_list',
        availbudget: '.avlBudget',
        boxValueIncome: '.boxValueIncome',
        boxValueExpense: '.boxValueExpense',
        boxPercentage: '.boxPercentage',
        detailsContainer: '.details'
    };

    return {
        getInput: function(){
            return{
                choose: document.querySelector(DOMnames.inputType).value,
                desc: document.querySelector(DOMnames.inputDesc).value,
                value: parseFloat(document.querySelector(DOMnames.inputValue).value)
            }
        },
        addItemList:function(object,type){
            var html,newHtml,listName;
            
            //the html codes with the placeholder

            if(type === 'inc'){
                listName = DOMnames.incomeContainer;

                html = '<div class="item " id="inc-%id%"><div class="item__description">%description%</div><div class="right "><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete"><i class="material-icons clear">clear</i></button></div></div></div>' ;
            }else if(type === 'exp'){
                listName = DOMnames.expenseContainer;

                html = '<div class="item expense_bg" id="exp-%id%"><div class="item__description">%description%</div><div class="right "><div class="item__value">- %value%</div><div class="item__delete"><button class="item__delete"><i class="material-icons clear">clear</i></button></div></div></div>' ;
            }

            //giving the input values in the placeholder

            newHtml = html.replace('%id%',object.id);
            newHtml = newHtml.replace('%description%',object.description);
            newHtml = newHtml.replace('%value%',object.value);

            //adding the item in the UI
            document.querySelector(listName).insertAdjacentHTML('beforeend',newHtml);

        },
        removeItem : function(selectorID){

            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fieldList,fieldArr;
            
            fieldList = document.querySelectorAll(DOMnames.inputDesc + ', ' + DOMnames.inputValue);
            fieldArr = Array.prototype.slice.call(fieldList);
            fieldArr.forEach(function(current,index,array){
                current.value = "";
            });
            fieldArr[0].focus();

        },
        getBudgetUI: function(obj){
            console.log(obj);
            document.querySelector(DOMnames.availbudget).textContent=obj.AvlblBudget;
            if(obj.totalInc>0){
                document.querySelector(DOMnames.boxValueIncome).textContent='+ ' + obj.totalInc;
            }else{
                document.querySelector(DOMnames.boxValueIncome).textContent=0;
            }
            if(obj.totalExp>0){
                document.querySelector(DOMnames.boxValueExpense).textContent='- ' + obj.totalExp;
            }else{
                document.querySelector(DOMnames.boxValueExpense).textContent=0;
            }
            
           
            if(obj.percentage > 0){
                document.querySelector(DOMnames.boxPercentage).textContent=obj.percentage + '%';
            }else{
                document.querySelector(DOMnames.boxPercentage).textContent='--';
            }
            

            
        },

        getDOMnames: function(){
            return DOMnames;
        }
    }

})();

//Global App controller
var Controller = (function(budgetCtrl,UICtrl){
    var initEventListener = function(){
        var DOM = UICtrl.getDOMnames();
        
        //Check button clicked
        document.querySelector(DOM.inputCheck).addEventListener('click',addDetails);
        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                addDetails();
            } 
        });
        
        //Event Delegation
        document.querySelector(DOM.detailsContainer).addEventListener('click',clickDeleteItem);
    }
    
    var clickDeleteItem = function(event){
        var elementId ,slicedelementId,type,ID;
        elementId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(elementId);
        if(elementId){
            slicedelementId = elementId.split('-');
            type = slicedelementId[0];
            ID = parseInt(slicedelementId[1]);

            //delete the item from the dataStructure
            budgetCtrl.deleteItem(type,ID);

            //delete the item from the UI
            UICtrl.removeItem(elementId);

            //update the budget
            UpdateBudget(type);
        };
        
    };

    var UpdateBudget = function(type){
        //1.Calculate the budget
        budgetCtrl.calBudget(type);
        
        //2.get the ebudget
        var budget = budgetCtrl.getBudget();
        
        //3.Update budget to UI
        UICtrl.getBudgetUI(budget);


    };

    var addDetails = function(){
        //1.Get value from input fields
        var input=UICtrl.getInput();
        if(input.desc !="" && !isNaN(input.value) && input.value>0){
            //2.Add the item to the budget controller
            var newItem = budgetController.addItem(input.choose,input.desc,input.value);

            //3.Update the income/expense details
            var addItemUI = UICtrl.addItemList(newItem,input.choose);

            //4.clear allfields
            UICtrl.clearFields();
            
            //5.Budget update
            UpdateBudget(input.choose);
        }
        

        
    };
    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.getBudgetUI({
                totalInc : 0,
                totalExp : 0,
                AvlblBudget : 0,
                percentage: -1
            });
            initEventListener();
        }
    }
    

})(budgetController,UIController);

var initEvents = Controller.init();
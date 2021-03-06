// Wird ausgeführt, sobald Seite geladen ist.
$(document).ready(function(){

    getAndFillGrid();

    var categoryItem = $('#menu-categories').find('li');
    categoryItem.on('click', function(){
        categoryItem.removeClass('active');
        $(this).addClass('active');
        getAndFillGrid();
    });

    $('#reset-order').on('click', function(){
        $.post('ajax.php', {'action': 'resetOrder'}, function(data){
            if (data.success)
                getAndFillGrid();
        }, 'json');
    });

    $('#commit-order').on('click', function(){
        var param = {
            'action': 'commitOrder'
        };
        $.post('ajax.php', param, function(data){
            if (data.success)
                getAndFillGrid();
            else
                makeDialog("Fehler", data.result);
        }, 'json');
    });

    $('#cancel-order').on('click', cancelOrder);

    $('#loginButton').on('click', logIn);

    $('#logOut').on('click', logOut);

    $('#eventButton').on('click', saveEvent);
});

function getAndFillGrid()
{
    var listItem = $('ul.menu-item-listing').find('li');
    listItem.remove();
    var key = $('#menu-categories').find('.active').attr('data-key');

    switch (key) {
        case 'product':
            $.post('ajax.php', {'action': 'getProduct'}, function(data){createProductListing(data)}, 'json');
            break;
        case 'menu':
            $.post('ajax.php', {'action': 'getMenu'}, function(data){createMenuListing(data)}, 'json');
            break;
    }
}

function createProductListing(data)
{
    var listItem = '';
    $.each(data.result, function(key, item){
        var price = item.price;
        var amount = item.unit !== "Stück" ? item.portion / 1000 + " " + item.unit : item.unit;
        amount = amount.replace('.',',');
        $.post('ajax.php', {'action': 'getOrder', 'param': {'key': 'product', 'id': item.ID}}, function(data){
            if (data.result > 0)
                listItem = '<li data-ID="' + item.ID + '"><h2>' + item.name + '</h2><h2 class="orders">'+data.result+'x</h2><span>' + amount + '</span><h1>€ ' + price + '</h1></li>';
            else
                listItem = '<li data-ID="' + item.ID + '"><h2>' + item.name + '</h2><h2 class="orders"></h2><span>' + amount + '</span><h1>€ ' + price + '</h1></li>';
            $('ul.menu-item-listing').append(function(){
                return $(listItem).on('click', function(){
                    addOrder(this);
                });
            });
        }, 'json');
    });
}

function createMenuListing(data)
{
    var listItem = '';
    $.each(data.result, function(key, item){
        var price = item.price;
        $.post('ajax.php', {'action': 'getOrder', 'param': {'key': 'menu', 'id': item.ID}}, function(data){
            if (data.result > 0)
                listItem = '<li data-ID="' + item.ID + '" data-orders="0"><h2>' + item.name + '</h2><h2 class="orders">'+data.result+'x</h2><span>' + item.desc + '</span><h1>€ ' + price + '</h1></li>';
            else
                listItem = '<li data-ID="' + item.ID + '" data-orders="0"><h2>' + item.name + '</h2><h2 class="orders"></h2><span>' + item.desc + '</span><h1>€ ' + price + '</h1></li>';
            $('ul.menu-item-listing').append(function(){
                return $(listItem).on('click', function(){
                    addOrder(this);
                });
            });
        }, 'json');
    });
}

function addOrder(item)
{
    $.post('ajax.php', {
        'action': 'addOrder',
        'param': {
            'key': $('#menu-categories').find('.active').attr('data-key'),
            'id': $(item).attr('data-ID')
        }
    }, function(data){
        var orders = '<h2 class="orders">'+data.result+'x</h2>';
        $(item).find('h2.orders').remove();
        $(orders).insertAfter($(item).find('h2'));
    }, 'json');
}

function cancelOrder()
{
    var buttons = {
        "Ja": function() {
            $.post("ajax.php", {'action': 'deleteLastOrder'}, function(data){
                makeDialog("Storno", data.result, null);
            }, "json");
            $(this).dialog("close");
        },
        "Nein": function() {
            $(this).dialog("close");
        }
    };

    makeDialog("Bestätigen", "Möchten Sie wirklich die letzte Bestellung stornieren?", buttons);
}

function makeDialog(title, message, button)
{
    if (button === null)
        button = {
            "OK": function(){
                $(this).dialog("close");
            }
        };

    var dialog = $('<div id="dialog-confirm" title="' + title + '">\n' +
        '  <p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>' + message + '</p>\n' +
        '</div>');

    var dia = dialog.dialog({
        autoOpen: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: button
    });

    dia.dialog("open");
}

function logIn()
{
    var userName = $('#userName').val();
    var password = $('#password').val();

    if (userName === "") {
        return;
    }

    if (password === "") {
        return;
    }

    var param = {
        'action': 'login',
        'param': {
            'userName': userName,
            'password': password
        }
    };

    $.post('ajax.php', param, function(){
        location.reload();
    }, 'json');
}

function logOut()
{
    $.post('ajax.php', {'action': 'logOut'}, function(){
        location.reload();
    }, 'json');
}

function saveEvent()
{
    $.post('ajax.php', {'action': 'saveEvent', 'param': {'eventID': $('select option:selected').val()}}, function(){
        location.reload();
    }, 'json');
}
javascript:
function checkIfTimeScriptAlreadyRunning() {
    if (document.getElementById('backSnipeTimer') !== null) {
        UI.ErrorMessage('Erro! O script já está ativo. Por favor dê reload na página para o correr novamente.', 3000);
        return false;
    }
    return true;
}

function addScreenTimer(screen, mode = null) {
    if (!checkIfTimeScriptAlreadyRunning()) return;
    var attachTimerTo = null;
    if (screen === 'map') {
        attachTimerTo = document.getElementById('popup_box_popup_command');
        if (attachTimerTo === null) {
            UI.ErrorMessage('Erro! Este script pode ser corrido pela página do mapa, mas apenas na tela de confirmação de ataque.', 3000);
            return;
        } else if (attachTimerTo.getElementsByTagName('h3')[0].innerText === 'Distribuir comandos') {
            UI.ErrorMessage('Erro! Este script pode ser corrido pela página do mapa, mas apenas na tela de confirmação de ataque.', 3000);
            return;
        }
    } else {
        attachTimerTo = document.getElementById('content_value');
        if (attachTimerTo === null || mode !== null) {
            UI.ErrorMessage('Erro! Este script pode ser corrido pela praça de reuniões, mas apenas na tela de confirmação de ataque.', 3000);
            return;
        } else if (attachTimerTo.getElementsByTagName('h3')[0].innerText === 'Distribuir comandos') {
            UI.ErrorMessage('Erro! Este script pode ser corrido pela praça de reuniões, mas apenas na tela de confirmação de ataque.', 3000);
            return;
        }
    }

    attachTimerTo.style.position = "relative";
    attachTimerTo.innerHTML = '<div style="position: absolute;position: absolute;left: 450px;top: 115px;background: #c1a264;padding: 15px;text-align: center;z-index: 1000000;">' +
    '<h4>Tempo do servidor</h4><span id="backSnipeTimer"></span></div>' + attachTimerTo.innerHTML;
    const targetNode = document.getElementById('serverTime');
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            document.getElementById('backSnipeTimer').innerHTML = mutation.target.innerHTML;
        });
    });
    observer.observe(targetNode, { childList: true });
    UI.SuccessMessage("Timer loaded successfully!");
}

function checkIfScriptAlreadyRunning() {
    if (document.getElementById('calcBackSnipeButton') !== null) {
        UI.ErrorMessage('Erro! O script já está ativo. Por favor dê reload na página para o correr novamente.', 3000);
        return false;
    }
    return true;
}

function incomingCommandsSectionPresent() {
    if (document.getElementById('commands_incomings') === null) {
        UI.ErrorMessage('Erro! Não existem ataques a chegar a esta aldeia.', 3000);
        return false;
    }
    return true;
}

function clearOtherIncomingAttackCheckboxes(checkboxObj) {
    Array.from(document.querySelectorAll('input[type=checkbox]')).forEach(function(checkbox) {
        if (checkbox !== checkboxObj) {
            checkbox.checked = false;
        }
    });
}

function getIncomingAttacks() {
    if (!checkIfScriptAlreadyRunning()) return;
    if (!incomingCommandsSectionPresent()) return;
    var incomingAttacksDiv = document.getElementById('commands_incomings');
    var incomingAttackTh = incomingAttacksDiv.getElementsByTagName('tr')[0];
    incomingAttackTh.innerHTML = '<th>Calcular Snipe</th>' + incomingAttackTh.innerHTML;
    var incomingAttacksTr = incomingAttacksDiv.getElementsByClassName('command-row');

    Array.prototype.forEach.call(incomingAttacksTr, function(element) {
        element.innerHTML = '<td><input type="checkbox" class="incomingAttack" value="this" onclick="clearOtherIncomingAttackCheckboxes(this)"></td>' + element.innerHTML;
    });
    
    /* Visual fix */
    incomingAttacksDiv.getElementsByTagName('tbody')[0].querySelector('tr:last-child').querySelector('td:first-child').setAttribute('colspan', 5);

    /* Adds Calculate Snipe button */
    incomingAttacksDiv.getElementsByTagName('tbody')[0].innerHTML += '<tr><td><input type="button" onclick="triggetAttackCancelTimePrompt()" id="calcBackSnipeButton" class="btn" value="Calcular Snipe"></td><td colspan="4"><a href="#"><i class="icon info-med" onclick="backDisplaySnipeTooltip()"></i></a></td></tr>'; 

    UI.SuccessMessage("Backtime calculator loaded successfully.");
}


function loadBackSnipeScript() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('screen') === 'overview') {
        getIncomingAttacks();
    } else if (urlParams.get('screen') === 'map') {
        addScreenTimer('map');
    } else if (urlParams.get('screen') === 'place') {
        addScreenTimer('place', urlParams.get('mode'));
    } else {
        UI.ErrorMessage('Erro! Este script apenas pode ser corrido através do ecrã do principal, mapa ou de ataque (pronto a enviar).\nRedirecionando...', 2000);
        setTimeout(function() {urlParams.set('screen', 'overview'); location.href = window.location.origin + window.location.pathname + '?' + urlParams.toString();}, 1000);
    }
}

loadBackSnipeScript();


function formatDateOutput(dateValue) {
    return ('0' + dateValue.getDay()).slice(-2) + ' ' + ('0' + dateValue.getMonth()).slice(-2) + ' ' + dateValue.getFullYear() + ' às ' + dateValue.getHours() + ':' + dateValue.getMinutes() + ':' + dateValue.getSeconds() + ':' + ('000' + dateValue.getMilliseconds()).slice(-3);
}

function backDisplaySnipeTooltip() {
    var i = $.extend({
        class_name: "",
        close_from_fader: !0,
        auto_width: !1,
        allow_close: 1,
        priority: Dialog.PRIORITY_NONE,
        subdialog: !0,
        body_class: "dialog-open"
    });
    var dialogContent = '<div style="text-align:center;"><h2>Help</h2><h3><br>Time calculator</h3>O objetivo deste script é para facilitar o <b>calculo de backsnipes</b>.<br><br>' + 
    'Para o utilizar, basta <b>selecionar apenas 1 ataque numa determinada aldeia</b>, clicando na checkbox que apareceu ao lado dela, e em seguida, no <b>botão "Calcular"</b>.<br><br>' + 
    'O script irá fazer as contas de a que tempo deve mandar o seu ataque e cancelar para que este <b>caia depois do ataque que você selecionou ataque</b>.<br><br>' +
    'Os <b>segundos têm de ser 0 ou um múltiplo de 2</b>.<br><br><b>O backsnipe deve ser feito com base na data e hora do servidor</b>, a qual pode ser encontrada no lado direito em baixo ' +
    'do seu ecrã, em "<b>Hora do servidor</b>".<br><br><hr><br><h3>World time</h3>Este script pode também ser corrido nos ecrãs de confirmação de ataques para <b>criar um secção</b> no mesmo que irá mostrar a ' + 
    '<b>hora atual do servidor</b> sem o utilizador ter de estar à procura dela no canto inferior direito do ecrã.<br><br>As horas, minutos, e segundos ai apresentados <b>serão exatamente os mesmo dos do ' + 
    'servidor</b>, sem delay.<br><br></div>';

    Dialog.show("import", dialogContent, Dialog.close(), i);
}

function createDialog(type, dialogContent, endFunction) {
    var i = $.extend({
        class_name: "",
        close_from_fader: !0,
        auto_width: !1,
        allow_close: 1,
        priority: Dialog.PRIORITY_NONE,
        subdialog: !0,
        body_class: "dialog-open"
    });
    Dialog.show("import", dialogContent, Dialog.close(), i);
}

function triggetAttackCancelTimePrompt() {
    var checkboxes = document.getElementById('commands_incomings').querySelector('input[type=checkbox]:checked');
    if (checkboxes === null || checkboxes === undefined) {
        UI.ErrorMessage('Erro! Por favor selecione uma checkbox.', 3000);
        return;
    }
  
    var dialogContent = '<div style="text-align:center;"><h3>Back time calculator</h3>Qual é o tempo que quer usar para cancelar o comando (máximo 19:58)?<br><br><input type="text" id="attackCancelTime" placeholder="Ex: 18:00"><br><br><input type="button" onclick="calcBackSnipe()" class="btn" value="Calcular"></div>';
    createDialog("import", dialogContent, Dialog.close());
}

function triggetFinalPrompt(attackArrivingTimeDateObj, currentDateCancel) {
    var i = $.extend({
        class_name: "",
        close_from_fader: !0,
        auto_width: !1,
        allow_close: 1,
        priority: Dialog.PRIORITY_NONE,
        subdialog: !0,
        body_class: "dialog-open"
    });
    var dialogContent = '<div style="text-align:center;"><h3>Back time calculator</h3>O ataque deve ser a partir de <b><br>' + formatDateOutput(attackArrivingTimeDateObj) + '<br><br></b>E cancelado em <b><br>' + formatDateOutput(currentDateCancel) + '<br><br></b></div>';
    createDialog("import", dialogContent, Dialog.close());
}

function calcBackSnipe() {
    var checkboxes = document.getElementById('commands_incomings').querySelector('input[type=checkbox]:checked');
    if (checkboxes === null || checkboxes === undefined) {
        UI.ErrorMessage('Erro! Por favor selecione uma checkbox.', 3000);
        return;
    }
    var attackArrivingUnixNoMs = checkboxes.parentElement.parentElement.childNodes[6].childNodes[1].getAttribute('data-endtime');
    var attackArrivingMs = checkboxes.parentElement.parentElement.childNodes[4].childNodes[1].innerHTML;
    var attackArrivingTime = (attackArrivingUnixNoMs + attackArrivingMs);


    var attackCancelTimeStr = document.getElementById('attackCancelTime').value;
    var attackCancelTime = /(\d{2}:\d{2})/.exec(attackCancelTimeStr);
    if (attackCancelTime === null) {
        attackCancelTime = /(\d{1}:\d{2})/.exec(attackCancelTimeStr);
        if (attackCancelTime === null) {
            UI.ErrorMessage('Erro! Por favor verifique o valor introduzido. (Ex: "01:00" ou "18:00" ou "14:24")', 3000);
            return;
        }
    }

    attackCancelTime = attackCancelTime[0];
    if (Number(attackCancelTime.split(':')[1]) % 2 !== 0) {
        UI.ErrorMessage('Erro! O último segundo tem de ser um 0 ou um múltiplo de 2 (Ex: "01:00" ou "18:00" ou "14:24").', 3000);
        return;
    }

    var attackCancelTimeInMs = Number(attackCancelTime.split(':')[0]) * 60 * 1000 + Number(attackCancelTime.split(':')[1]) * 1000;
    
    var attackArrivingTimeDateObj = new Date(attackArrivingTime - attackCancelTimeInMs);
    
    /* Disregard milliseconds for the cancel time */
    var currentDateCancel = new Date(attackArrivingTimeDateObj.getTime() - attackArrivingTimeDateObj.getMilliseconds() + (attackCancelTimeInMs / 2));

    Dialog.close();
    triggetFinalPrompt(new Date(attackArrivingTimeDateObj.getTime() + 1), currentDateCancel);
}
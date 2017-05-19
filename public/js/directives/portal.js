app.directive("portal", function() {
    return {
        link: function($scope, element, attrs) {
            var vm = $scope.vm;
            init2(element);
            var showWorld = function() {
                var notWorld = $('.notWorld');
                notWorld.addClass('myHidden');
                var returnButton = $('#returnButton');
                returnButton.removeClass('hidden');
                sceneManager.enableControls(true);
            };
            element.on("mouseenter", initCircles);
            element.on("mouseleave", stopTween);
            element.on("click", showWorld);

            $scope.$on('$destroy', function() {
                element.off('mouseenter', testfunction);
                element.off('mouseleave', stopTween);
            });
        }
    };
});


var canvas, ctx, ctx2, cw, ch, centerX, centerY, pulse;
var circProps = { centerX: 100, centerY: 100, r: 10, strokeStyle: 'rgba(255,255,255,0)' };
var circ2Props = { centerX: 100, centerY: 100, r: 15, strokeStyle: 'rgba(255,255,255,0)' };
var tweenare;
var position = {
    r: 1
};

function init2(element) {
    canvas = element[0];
    ctx = canvas.getContext("2d");
    cw = canvas.width;
    ch = canvas.height;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    onEnterFrame(1);


}

function drawCirc(obj, r) {

    // Draw first circle
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, obj.r * r, 0, 2 * Math.PI, false);
    ctx.lineWidth = 4;
    ctx.stroke();
}

function initCircles() {


    var target = {
        r: 3
    };
    tweenare = new TWEEN.Tween(position).to(target, 1000);

    tweenare.onUpdate(function() {
        onEnterFrame(position.r);
    }).repeat(Infinity).yoyo(true).start();

}

function stopTween() {
    tweenare.stop();

    var target = {
        r: 1
    };
    var tween = new TWEEN.Tween(position).to(target, 1000).onUpdate(function() {
        onEnterFrame(position.r);
    }).start();


}

function onEnterFrame(r) {
    ctx.clearRect(0, 0, cw, ch);
    drawCirc(circProps, r);
    // drawCirc(circ2Props, r);
}

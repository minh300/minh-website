angular.module('directives.portal', []).directive("portal", function() {
    var ctx, cw, ch, centerX, centerY, radius = 10;
    var position = { r: 1 },
        startPosition = { r: 1 },
        endPosition = { r: 3 };
    var startTween = new TWEEN.Tween(position).to(endPosition, 1000).onUpdate(function() {
        draw(position.r);
    }).repeat(Infinity).yoyo(true);

    var stopTween = new TWEEN.Tween(position).to(startPosition, 500).onUpdate(function() {
        draw(position.r);
    });

    function initPortal(element) {
        var canvas = element[0];
        ctx = canvas.getContext("2d");
        cw = canvas.width;
        ch = canvas.height;
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        draw(1);
    }

    function animate() {
        stopTween.stop();
        startTween.start();
    }

    function stopAnimation() {
        startTween.stop();
        stopTween.start();
    }

    function draw(multipler) {
        ctx.clearRect(0, 0, cw, ch);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * multipler, 0, 2 * Math.PI, false);
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    function showWorld() {
        var foreGround = $('.foreGround');
        foreGround.addClass('myHidden');
        foreGround.removeAttr("style"); //resets any style set
        var returnButton = $('#returnButton');
        returnButton.removeClass('hidden');
        sceneManager.enableControls(true);
    };

    return {
        link: function($scope, element, attrs) {
            initPortal(element);

            element.on("mouseenter", animate);
            element.on("mouseleave", stopAnimation);
            element.on("click", showWorld);

            $scope.$on('$destroy', function() {
                element.off('mouseenter', testfunction);
                element.off('mouseleave', stopAnimation);
                element.off('click', showWorld);
            });
        }
    };
});

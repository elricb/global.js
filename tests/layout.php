<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http‎://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" /><meta http-equiv="Content-Language" content="en" />
    <meta name="viewport" content="initial-scale=1">

<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="../global.js"></script>
<script src="../objects/Layout.js"></script>

<link rel="stylesheet" type="text/css" href="../global.css">

<style type="text/css">
    #content {
        margin:0px auto;
        padding:2px;
    }
    #right {
        max-width:10in;
        min-width:1.7in;
        margin:2px;
        padding:2px;
        background-color:#DDDDDD;
        border:2px solid #AAAAAA;
    }
    #left {
        max-width:2in;
        min-width:0in;
        margin:2px;
        padding:2px;
        background-color:#DDDDDD;
        border:2px solid #AAAAAA;
    }
    #labels {
        display:block;
        position:relative;
        margin:0px;
        padding:0px;
        border:none;
    }
    .privateLabel-wrapper {
        display:-moz-inline-stack;
        display:inline-block;
        zoom:1;
        *display:inline;
        position:relative;
        vertical-align:top;
        background-color:#AAAAAA;
        border-radius: 6px;
        margin:6px;
        padding:10px;
    }
</style>
<script type="text/javascript">
    $(document).ready(function(){
        Elements.unifyDimensions("#labels .privateLabel-wrapper");
        Elements.inlineJustify("#labels", ".privateLabel-wrapper", {
            "min-width":"1.7in", //fit contents or this... whatever is larger
            "offset":4           //shadow offset - this needs some autofixin'
        });
    });
</script>


<div id="body">
    <div id="header">
        
    </div>
    <div id="content">
        <div id="left" class="inlineblock">
            <?php
                $w = ($_REQUEST["width"])?$_REQUEST["width"]:40;
                $h = ($_REQUEST["height"])?$_REQUEST["height"]:30;
                echo("<img src='http://placekitten.com/$w/$h' />");
            ?>
        </div>
        <div id="right" class="inlineblock">
            <?php
                include("sample.php");
            ?>
        </div>
    </div>
    <div id="footer">
        
    </div>
</div>

</body>
</head>
</html>


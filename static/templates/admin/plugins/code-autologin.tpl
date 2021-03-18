<form role="form" class="code-autologin-settings">
  <div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">General</div>
    <div class="col-sm-10 col-xs-12">
      <div class="checkbox">
        <label for="autologin-enabled" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
          <input type="checkbox" class="mdl-switch__input" id="autologin-enabled" name="autologin-enabled">
          <span class="mdl-switch__label"><strong>Activate Autologin</strong></span>
        </label>
      </div>
      <div class="form-group">
        <label for="endpoint">Authorization Endpoint</label>
        <input type="text" id="endpoint" name="endpoint" title="Authorization Endpoint" class="form-control" placeholder="https://">
      </div>
    </div>
  </div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
  <i class="material-icons">save</i>
</button>
describe('Protocol', function() {
  var protocol;

  beforeEach(function() {
    protocol = new weechat.Protocol();
  });

  it('should read version', function() {
    var test = [0, 0, 0, 32, 0, 255, 255, 255, 255, 105, 110, 102, 0, 0, 0, 7, 118, 101, 114, 115, 105, 111, 110, 0, 0, 0, 5, 48, 46, 52, 46, 49];
    var res = protocol.parse(test).objects[0];
    expect(res.type).toEqual('inf');
    expect(res.content.key).toEqual('version');
    expect(res.content.value).toEqual('0.4.1');
  });
});

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

  it('should format init', function() {
    expect(weechat.Protocol.formatInit()).toEqual('init compression=off\n');

    expect(weechat.Protocol.formatInit({
      password: 'test'
    })).toEqual('init compression=off,password=test\n');

    expect(weechat.Protocol.formatInit({
      password: 'test',
      compression: 'herpaderp'
    })).toEqual('init compression=herpaderp,password=test\n');
  });

  it('should format hdata', function() {
    expect(weechat.Protocol.formatHdata({
      path: 'buffer:gui_buffers(*)',
      keys: ['herp,aderp,short_name']
    })).toEqual('hdata buffer:gui_buffers(*) herp,aderp,short_name\n');

    expect(weechat.Protocol.formatHdata({
      id: 42,
      path: 'buffer:gui_buffers(*)',
      keys: ['herp,aderp,short_name']
    })).toEqual('(42) hdata buffer:gui_buffers(*) herp,aderp,short_name\n');
  });

  it('should format info', function() {
    expect(weechat.Protocol.formatInfo({
      name: 'test'
    })).toEqual('info test\n');

    expect(weechat.Protocol.formatInfo({
      id: 42,
      name: 'test'
    })).toEqual('(42) info test\n');
  });

  it('should format nicklist', function() {
    expect(weechat.Protocol.formatNicklist({
      buffer: 'test'
    })).toEqual('nicklist test\n');

    expect(weechat.Protocol.formatNicklist({
      id: 42,
      buffer: 'test'
    })).toEqual('(42) nicklist test\n');
  });

  it('should format input', function() {
    expect(weechat.Protocol.formatInput({
      buffer: 'test',
      data: 'data'
    })).toEqual('input test data\n');

    expect(weechat.Protocol.formatInput({
      id: 42,
      buffer: 'test',
      data: 'data'
    })).toEqual('(42) input test data\n');
  });

  it('should format sync', function() {
    expect(weechat.Protocol.formatSync()).toEqual('sync\n');

    expect(weechat.Protocol.formatSync({
      buffers: ['test1', 'test2']
    })).toEqual('sync test1,test2\n');

    expect(weechat.Protocol.formatSync({
      buffers: ['test1', 'test2'],
      options: ['option1', 'option2']
    })).toEqual('sync test1,test2 option1,option2\n');

    expect(weechat.Protocol.formatSync({
      id: 42,
      buffers: ['test1', 'test2'],
      options: ['option1', 'option2']
    })).toEqual('(42) sync test1,test2 option1,option2\n');
  });

  it('should format test', function() {
    expect(weechat.Protocol.formatTest()).toEqual('test\n');

    expect(weechat.Protocol.formatTest({
      id: 42
    })).toEqual('(42) test\n');
  });

  it('should format quit', function() {
    expect(weechat.Protocol.formatQuit()).toEqual('quit\n');
  });

  it('should format ping', function() {
    expect(weechat.Protocol.formatPing()).toEqual('ping\n');

    expect(weechat.Protocol.formatPing({
      id: 42
    })).toEqual('(42) ping\n');

    expect(weechat.Protocol.formatPing({
      id: 42,
      args: ['test1', 'test2']
    })).toEqual('(42) ping test1 test2\n');
  });

  it('should parse hdata', function() {
    var data = [0, 0, 0, 110, 0, 65533, 65533, 65533, 65533, 104, 100, 97, 0, 0, 0, 6, 98, 117, 102, 102, 101, 114, 0, 0, 0, 14, 115, 104, 111, 114, 116, 95, 110, 97, 109, 101, 58, 115, 116, 114, 0, 0, 0, 4, 7, 49, 102, 54, 48, 98, 49, 48, 0, 0, 0, 7, 119, 101, 101, 99, 104, 97, 116, 7, 49, 102, 97, 97, 99, 99, 48, 0, 0, 0, 5, 116, 101, 115, 116, 49, 7, 50, 56, 99, 98, 99, 102, 48, 0, 0, 0, 6, 35, 116, 101, 115, 116, 49, 7, 50, 57, 56, 56, 54, 48, 48, 65533, 65533, 65533, 65533];

    var res = protocol.parse(data);
    res = res.objects[0];
    expect(res.type).toEqual('hda');
    expect(res.content.length).toEqual(4);
    expect(res.content[0].short_name).toEqual('weechat');
    expect(res.content[1].short_name).toEqual('test1');
    expect(res.content[2].short_name).toEqual('#test1');
  });

  it('should parse info with version', function() {
    var data = [0, 0, 0, 34, 0, 0, 0, 0, 2, 52, 50, 105, 110, 102, 0, 0, 0, 7, 118, 101, 114, 115, 105, 111, 110, 0, 0, 0, 5, 48, 46, 52, 46, 49];

    var res = protocol.parse(data);
    expect(res.id).toEqual('42');
    expect(res.objects[0].content.value).toEqual('0.4.1');
  });
});

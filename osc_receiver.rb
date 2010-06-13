require 'osc'
require 'thread'
require 'json'
require 'queue'

class OSCReceiver

  def initialize(host, port)
    @host = host
    @port = port
    @queues = {}

    @server = OSC::UDPServer.new
    @server.bind(@host, @port)
    @server.add_method '/*', nil do |message|
      broadcast([message])
    end

    Thread.new do
      @server.serve
    end
  end

  def broadcast(messages, sender_id = nil)
    @queues.each_key do |client_id|
      unless client_id == sender_id
        send(client_id, messages)
      end
    end
  end

  def send(client_id, messages)
    queue = @queues[client_id]
    messages = messages.map {|message| { :address => message.address, :args => message.args } }
    queue.push(messages)
  end
  
  def call(env)
    client_id = env['PATH_INFO'][1..-1]
    queue = @queues[client_id]

    if queue.nil?
      queue = @queues[client_id] = TQueue.new
      messages = $manager.messages
    else
      messages = queue.wait
    end

    [200, {'Content-Type' => 'text/html'}, messages.to_json]
  end
end
  

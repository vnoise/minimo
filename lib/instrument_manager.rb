require 'message'
require 'slider'
require 'instrument'

class InstrumentManager

  attr_reader :instruments

  def initialize
    system "chuck + Parameter.ck"
    system "chuck + Mode.ck"
    system "chuck + Instrument.ck"

    @instruments = []
  end

  def create
    # 4.times do |index| 
    #   @instruments << Instrument.new(index)
    # end

    # @instruments.each do |instrument|
    #   instrument.create
    #   sleep 0.5
    #   instrument.send_updates
    # end
  end

  def saves
    (Dir.entries('saves') - ['.', '..']).map {|file| file.chomp('.yml') }
  end

  def samples
    (Dir.entries('samples') - ['.', '..']).map {|file| file.chomp('.wav') }
  end

  def load(file)
    open("saves/#{file}", "rb") do |io|
      @instruments = Marshal.load(io.read)
    end

    @instruments.each do |instrument|
      instrument.send_updates
    end
  end

  def save
    index = (saves.max || '0').succ
    open("saves/#{index}", "wb") {|io| io << Marshal.dump(@instruments) }
  end

  def call(env)
    sender_id, type, *args = env['PATH_INFO'].split('/')[1..-1]

    handle(sender_id, type, *args)

    [200, {'Content-Type' => 'text/html'}, "OK"]
  end

  def handle(sender_id, type, *args)
    case type      
    when 'load' then load(*args)
    when 'save' then save
    else
      @instruments[args.first.to_i].handle(sender_id, type, args[1..-1])
    end
  end
end

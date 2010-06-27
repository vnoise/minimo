require 'message'
require 'slider'
require 'instrument'

class InstrumentManager

  attr_reader :instruments, :bpm

  def initialize
    @bpm = 120
    @instruments = []

    $sender.send(bpm_message)

    4.times do |index| 
      @instruments << Instrument.new(index)
    end

    @instruments.each do |instrument|
      instrument.send_updates
    end
  end

  def saves
    (Dir.entries('saves') - ['.', '..']).map {|file| file.chomp('.yml') }
  end

  def bpm_message
    Message.new('/bpm', 'f', @bpm.to_f)
  end

  def handle(sender_id, type, *args)
    case type
    when 'bpm'
      @bpm = args.first.to_f
      $sender.send(bpm_message)
      $receiver.broadcast([bpm_message], sender_id)
      
    when 'load'
      open("saves/#{args.first}", "rb") do |io|
        @instruments = Marshal.load(io.read)
      end

      @instruments.each do |instrument|
        instrument.send_updates
      end

    when 'save'
      index = (saves.max || '0').succ
      open("saves/#{index}", "wb") {|io| io << Marshal.dump(@instruments) }

    else
      @instruments[args.first.to_i].handle(sender_id, type, args[1..-1])
    end
  end

  def constructor_messages
    messages = []

    messages << bpm_message

    @instruments.each do |instrument|
      messages += instrument.constructor_messages
    end

    messages
  end
end

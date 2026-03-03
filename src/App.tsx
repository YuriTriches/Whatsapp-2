import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, MessageSquare, CheckCheck, Paperclip, Smile, Send, User, Lock, Edit2, Settings, LogOut, Camera } from 'lucide-react';

function App() {
  const [tela, setTela] = useState<'login' | 'registro' | 'chat'>('login');
  const [abaConfig, setAbaConfig] = useState(false);
  const [usuario, setUsuario] = useState<any>({ id: null, nome: '', foto_url: '', senha: '' });
  const [contatoAtivo, setContatoAtivo] = useState<any>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [listaContatos, setListaContatos] = useState<any[]>([]);

  // 1. BUSCA DADOS DO BANCO (CONTATOS E MENSAGENS)
  useEffect(() => {
    if (tela === 'chat') {
      // Busca a lista de contatos do banco yubi
      fetch('http://localhost:3001/usuarios')
        .then(res => res.json())
        .then(data => setListaContatos(data.filter((u: any) => u.id !== usuario.id)))
        .catch(err => console.error("Erro ao buscar contatos:", err));

      // Atualiza as mensagens em tempo real
      const interval = setInterval(() => {
        fetch('http://localhost:3001/mensagens')
          .then(res => res.json())
          .then(data => setMensagens(data))
          .catch(err => console.error("Erro ao carregar mensagens:", err));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [tela, usuario.id]);

  // 2. SISTEMA DE LOGIN E REGISTRO
  const lidarAuth = async (e: React.FormEvent, tipo: 'login' | 'registrar') => {
    e.preventDefault();
    const rota = tipo === 'login' ? 'login' : 'registrar';
    try {
      const res = await fetch(`http://localhost:3001/${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: usuario.nome, senha: usuario.senha })
      });
      const data = await res.json();
      if (res.ok) {
        setUsuario(data);
        setTela('chat');
      } else { alert(data.error); }
    } catch (err) { alert("Servidor offline! Verifique o terminal do Node."); }
  };

  // 3. ENVIAR MENSAGEM (CORRIGIDO)
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !contatoAtivo) return;

    const payload = {
      remetente_id: usuario.id,
      destinatario_id: contatoAtivo.id,
      conteudo: novaMensagem
    };

    try {
      const res = await fetch('http://localhost:3001/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setMensagens([...mensagens, data]);
        setNovaMensagem('');
      }
    } catch (err) {
      alert("Erro ao enviar! O servidor está ligado na porta 3001?");
    }
  };

  // 4. SALVAR CONFIGURAÇÕES DE PERFIL
  const salvarPerfil = async () => {
    try {
      const res = await fetch(`http://localhost:3001/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: usuario.nome, senha: usuario.senha, foto: usuario.foto_url })
      });
      
      if (res.ok) {
        alert("Perfil atualizado com sucesso!");
        setAbaConfig(false);
      }
    } catch (err) { alert("Erro ao atualizar perfil."); }
  };

  // TELA DE LOGIN / REGISTRO
  if (tela !== 'chat') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center border-t-[10px] border-[#00a884]">
        <div className="bg-white p-10 rounded-lg shadow-xl w-[400px] text-center">
          <MessageSquare size={60} className="mx-auto mb-4 text-[#00a884]" fill="currentColor" />
          <h2 className="text-2xl font-light mb-6">{tela === 'login' ? 'Login' : 'Criar Conta'}</h2>
          <form onSubmit={(e) => lidarAuth(e, tela as any)} className="space-y-4">
            <input className="w-full p-3 border rounded outline-none focus:ring-1 focus:ring-[#00a884]" type="text" placeholder="Nome de usuário" required onChange={(e) => setUsuario({...usuario, nome: e.target.value})} />
            <input className="w-full p-3 border rounded outline-none focus:ring-1 focus:ring-[#00a884]" type="password" placeholder="Senha" required onChange={(e) => setUsuario({...usuario, senha: e.target.value})} />
            <button className="w-full bg-[#00a884] text-white py-3 rounded font-bold hover:bg-[#018a6d] transition-colors">
              {tela === 'login' ? 'ENTRAR' : 'CADASTRAR AGORA'}
            </button>
          </form>
          <button onClick={() => setTela(tela === 'login' ? 'registro' : 'login')} className="mt-4 text-sm text-[#00a884] hover:underline">
            {tela === 'login' ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#dadbd3] flex items-center justify-center overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-[127px] bg-[#00a884] z-0"></div>
      <div className="w-[95%] max-w-[1600px] h-[95vh] bg-[#f0f2f5] flex shadow-2xl z-10 rounded-sm overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-[400px] bg-white border-r border-gray-300 flex flex-col">
          <header className="bg-[#f0f2f5] p-4 flex justify-between items-center">
            <img 
              src={usuario.foto_url || 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png'} 
              className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 object-cover border border-gray-300" 
              onClick={() => setAbaConfig(true)}
            />
            <div className="flex gap-4 text-[#54656f]">
              <Settings size={22} className="cursor-pointer hover:text-[#00a884]" onClick={() => setAbaConfig(true)} />
              <LogOut size={22} className="cursor-pointer hover:text-red-500" onClick={() => window.location.reload()} />
            </div>
          </header>

          {abaConfig ? (
            <div className="flex-1 p-6 bg-white animate-in slide-in-from-left duration-300">
              <h3 className="text-[#008069] font-bold mb-6 text-xl">Configurações de Perfil</h3>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <img src={usuario.foto_url || 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png'} className="w-40 h-40 rounded-full mb-4 object-cover border-4 border-gray-100 shadow-sm" />
                  <input type="text" placeholder="Link da foto (URL)" className="w-full p-2 border-b outline-none focus:border-[#00a884] text-sm" value={usuario.foto_url} onChange={(e) => setUsuario({...usuario, foto_url: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-[#008069] font-bold uppercase">Seu Nome</label>
                  <input type="text" className="w-full p-2 border-b outline-none focus:border-[#00a884]" value={usuario.nome} onChange={(e) => setUsuario({...usuario, nome: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-[#008069] font-bold uppercase">Sua Senha</label>
                  <input type="password" placeholder="Nova senha" className="w-full p-2 border-b outline-none focus:border-[#00a884]" onChange={(e) => setUsuario({...usuario, senha: e.target.value})} />
                </div>
                <button onClick={salvarPerfil} className="w-full bg-[#00a884] text-white py-3 rounded shadow-md hover:bg-[#018a6d] font-bold">SALVAR ALTERAÇÕES</button>
                <button onClick={() => setAbaConfig(false)} className="w-full text-gray-500 py-2 hover:bg-gray-50 rounded">Voltar para conversas</button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-2 bg-white border-b border-gray-100">
                <div className="bg-[#f0f2f5] flex items-center px-4 py-2 rounded-xl">
                  <Search size={18} className="text-gray-400 mr-4" />
                  <input type="text" placeholder="Pesquisar conversa" className="bg-transparent outline-none text-sm w-full" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {listaContatos.map((contato) => (
                  <div key={contato.id} onClick={() => setContatoAtivo({id: contato.id, nome: contato.nome_usuario, foto: contato.foto_url})} className={`flex p-4 cursor-pointer hover:bg-[#f5f6f6] items-center border-b border-gray-50 ${contatoAtivo?.id === contato.id ? 'bg-[#ebebeb]' : ''}`}>
                    <img src={contato.foto_url || 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png'} className="w-12 h-12 rounded-full mr-4 object-cover border border-gray-200" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center"><span className="font-medium text-[#111b21]">{contato.nome_usuario}</span></div>
                      <p className="text-sm text-gray-500 truncate">Clique para ver mensagens</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* CHAT AREA */}
        <main className="flex-1 flex flex-col bg-[#efeae2] relative">
          {contatoAtivo ? (
            <>
              <header className="bg-[#f0f2f5] p-3 flex items-center border-l border-gray-300 shadow-sm z-10">
                <img src={contatoAtivo.foto || 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png'} className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200" />
                <div className="flex-1">
                  <h4 className="font-semibold text-[#111b21]">{contatoAtivo.nome}</h4>
                  <p className="text-[12px] text-[#00a884] font-bold">online</p>
                </div>
              </header>
              <div className="flex-1 p-8 overflow-y-auto space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-40 flex flex-col">
                {mensagens.filter(m => (m.remetente_id === usuario.id && m.destinatario_id === contatoAtivo.id) || (m.remetente_id === contatoAtivo.id && m.destinatario_id === usuario.id)).map((msg, index) => (
                  <div key={index} className={`p-2.5 rounded-lg shadow-sm max-w-[65%] text-[14.2px] ${msg.remetente_id === usuario.id ? 'bg-[#d9fdd3] self-end rounded-tr-none' : 'bg-white self-start rounded-tl-none'}`}>
                    <p className="text-[#111b21]">{msg.conteudo}</p>
                    <span className="block text-[10px] text-gray-400 text-right mt-1">
                      {new Date(msg.enviada_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {msg.remetente_id === usuario.id && <CheckCheck size={14} className="inline ml-1 text-[#53bdeb]" />}
                    </span>
                  </div>
                ))}
              </div>
              <form onSubmit={enviarMensagem} className="bg-[#f0f2f5] p-3 flex items-center gap-4 border-l border-gray-300">
                <Smile size={26} className="text-[#54656f] cursor-pointer" />
                <Paperclip size={22} className="text-[#54656f] cursor-pointer rotate-45" />
                <input 
                  type="text" 
                  value={novaMensagem} 
                  onChange={(e) => setNovaMensagem(e.target.value)} 
                  className="flex-1 p-3 rounded-lg outline-none bg-white shadow-sm text-[15px]" 
                  placeholder="Digite uma mensagem" 
                />
                <button type="submit" className="text-[#54656f] hover:text-[#00a884] transition-transform active:scale-90">
                  <Send size={26} />
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center flex flex-col items-center">
              <div className="bg-gray-100 p-10 rounded-full mb-6 opacity-20"><MessageSquare size={100} /></div>
              <h2 className="text-3xl font-light text-gray-500">WhatsApp Web Clone</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">Conectado ao banco de dados **yubi**. Selecione um contato para conversar.</p>
              <div className="mt-20 text-gray-400 text-xs flex items-center gap-2 border-t pt-10 w-64 justify-center">
                <Lock size={12}/> Criptografado de ponta a ponta
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
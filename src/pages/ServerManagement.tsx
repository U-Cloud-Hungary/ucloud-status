import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Server, Copy } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory, updateCategory, deleteCategory, createServer, updateServer, deleteServer } from '../services/api';
import { Category } from '../types';

const ServerManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editingServer, setEditingServer] = useState<string | null>(null);
  const [editedServer, setEditedServer] = useState({
    name: '',
    location: '',
    categoryId: ''
  });
  const [newServer, setNewServer] = useState({
    name: '',
    location: '',
    categoryId: ''
  });

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategory('');
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const createServerMutation = useMutation({
    mutationFn: createServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewServer({ name: '', location: '', categoryId: '' });
    }
  });

  const updateServerMutation = useMutation({
    mutationFn: updateServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingServer(null);
    }
  });

  const deleteServerMutation = useMutation({
    mutationFn: deleteServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    createCategoryMutation.mutate({ name: newCategory.trim() });
  };

  const handleUpdateCategory = (categoryId: string) => {
    if (!editedCategoryName.trim()) return;
    updateCategoryMutation.mutate({ id: categoryId, name: editedCategoryName });
  };

  const handleCreateServer = (e: React.FormEvent, categoryId: string) => {
    e.preventDefault();
    if (!newServer.name.trim() || !newServer.location.trim()) return;
    createServerMutation.mutate({
      name: newServer.name,
      location: newServer.location,
      categoryId
    });
  };

  const handleUpdateServer = (serverId: string) => {
    if (!editedServer.name.trim() || !editedServer.location.trim()) return;
    updateServerMutation.mutate({
      id: serverId,
      ...editedServer
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Szerver Kezelés</h1>
        <p className="mt-1 text-sm text-slate-400">
          Kezelje a szerver kategóriákat és szervereket
        </p>
      </div>

      {/* Category Management */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
      >
        <h2 className="text-lg font-medium text-white mb-4">Kategóriák</h2>

        {/* Add Category Form */}
        <form onSubmit={handleCreateCategory} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Új kategória neve"
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newCategory.trim() || createCategoryMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Hozzáadás
            </button>
          </div>
        </form>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-slate-800/30 rounded-lg p-4"
            >
              {editingCategory === category.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedCategoryName}
                    onChange={(e) => setEditedCategoryName(e.target.value)}
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => handleUpdateCategory(category.id)}
                    className="p-2 text-emerald-400 hover:text-emerald-300"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-2 text-slate-400 hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category.id);
                        setEditedCategoryName(category.name);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCategoryMutation.mutate(category.id)}
                      className="p-2 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Servers in Category */}
              <div className="mt-4 space-y-2">
                {category.servers?.map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center justify-between bg-slate-700/30 rounded-md p-3"
                  >
                    {editingServer === server.id ? (
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editedServer.name}
                          onChange={(e) => setEditedServer({ ...editedServer, name: e.target.value })}
                          placeholder="Szerver neve"
                          className="bg-slate-600/50 border border-slate-500 rounded-md px-3 py-1 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={editedServer.location}
                          onChange={(e) => setEditedServer({ ...editedServer, location: e.target.value })}
                          placeholder="Helyszín"
                          className="bg-slate-600/50 border border-slate-500 rounded-md px-3 py-1 text-white text-sm"
                        />
                        <div className="col-span-2 flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateServer(server.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingServer(null)}
                            className="p-1 text-slate-400 hover:text-slate-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <Server className="h-4 w-4 text-slate-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-white">{server.name}</p>
                            <p className="text-xs text-slate-400">{server.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(server.apiKey)}
                            className="p-1 text-slate-400 hover:text-slate-300"
                            title="API kulcs másolása"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingServer(server.id);
                              setEditedServer({
                                name: server.name,
                                location: server.location,
                                categoryId: category.id
                              });
                            }}
                            className="p-1 text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteServerMutation.mutate(server.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Server Form */}
              <form onSubmit={(e) => handleCreateServer(e, category.id)} className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newServer.name}
                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    placeholder="Szerver neve"
                    className="bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 text-sm"
                  />
                  <input
                    type="text"
                    value={newServer.location}
                    onChange={(e) => setNewServer({ ...newServer, location: e.target.value })}
                    placeholder="Helyszín"
                    className="bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newServer.name.trim() || !newServer.location.trim() || createServerMutation.isPending}
                  className="mt-2 w-full px-4 py-2 bg-blue-600/50 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Szerver Hozzáadása
                </button>
              </form>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default ServerManagement;
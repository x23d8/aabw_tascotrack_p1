import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { identityService } from "@/services/mock-services";
import type { User } from "@/types";

interface PersonaContextValue { persona: User | null; personas: User[]; switchPersona: (id: string) => Promise<void> }
const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<User | null>(null);
  const [personas, setPersonas] = useState<User[]>([]);
  const queryClient = useQueryClient();
  useEffect(() => { void Promise.all([identityService.getCurrentPersona(), identityService.getPersonas()]).then(([current, list]) => { setPersona(current); setPersonas(list); }); }, []);
  const switchPersona = async (id: string) => { const next = await identityService.switchPersona(id); setPersona(next); await queryClient.invalidateQueries(); };
  return <PersonaContext.Provider value={{ persona, personas, switchPersona }}>{children}</PersonaContext.Provider>;
}

export function usePersona() { const context = useContext(PersonaContext); if (!context) throw new Error("usePersona must be used inside PersonaProvider"); return context; }

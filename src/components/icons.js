// Lucide: iconografía lineal (trazo + acento teal vía CSS)
import { createIcons } from 'lucide';
import {
  Brain, Home, LayoutGrid, GraduationCap, Info, Sun, Moon, Star, Flame,
  User, LogOut, Rocket, Play, Sigma, Gamepad2, Terminal, Mail, Lock, Eye,
  BookOpen, Calculator, CircleArrowRight, Share2, Network, ArrowLeftRight,
  Laptop, Bot, Shield, Globe, MapPin, Lightbulb, Code, Palette, Settings,
  ArrowLeft, Trash2, Table, Award, Loader2, Circle, Eraser, Route, Waypoints,
  MousePointer2, CircleHelp, X, Volume2, VolumeX, CircleCheck, CircleX,
  Crown, Link, Plus, TriangleAlert, CircleUser
} from 'lucide';

const iconRegistry = {
  Brain, Home, LayoutGrid, GraduationCap, Info, Sun, Moon, Star, Flame,
  User, LogOut, Rocket, Play, Sigma, Gamepad2, Terminal, Mail, Lock, Eye,
  BookOpen, Calculator, CircleArrowRight, Share2, Network, ArrowLeftRight,
  Laptop, Bot, Shield, Globe, MapPin, Lightbulb, Code, Palette, Settings,
  ArrowLeft, Trash2, Table, Award, Loader2, Circle, Eraser, Route, Waypoints,
  MousePointer2, CircleHelp, X, Volume2, VolumeX, CircleCheck, CircleX,
  Crown, Link, Plus, TriangleAlert, CircleUser
};

export function initIcons(root = document) {
  createIcons({
    icons: iconRegistry,
    root,
    attrs: {
      class: ['lk-icon'],
      'stroke-width': 2,
      'aria-hidden': 'true'
    },
    nameAttr: 'data-lucide'
  });
}

export function icon(name, extraClass = '') {
  const cls = extraClass ? `lk-icon ${extraClass}` : 'lk-icon';
  return `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
}

export function refreshIcons(container) {
  if (!container) return;
  initIcons(container);
}
